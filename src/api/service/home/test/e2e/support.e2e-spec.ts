import { INestApplication, ValidationPipe, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HomeSupportController } from '../../controller/home-support.controller';
import { AnswerSupportInquiryUseCase } from '../../application/use-cases/answer-support-inquiry.use-case';
import { GetFaqsUseCase } from '../../application/use-cases/get-faqs.use-case';
import { SUPPORT_AGENT_PORT } from '../../application/ports/support-agent.port';
import { SupportRateLimitGuard } from '../../decorator/support-rate-limit.guard';
import type { SupportInquiryResponseDto } from '../../dto/response/support-inquiry-response.dto';
import { SUPPORT_LOG_PORT } from '../../application/ports/support-log.port';
import { SubmitSupportFeedbackUseCase } from '../../application/use-cases/submit-support-feedback.use-case';

const dataOf = (response: { body: unknown }): SupportInquiryResponseDto =>
    (response.body as { data: SupportInquiryResponseDto }).data;

describe('AI 문의 HTTP 계약', () => {
    let app: INestApplication;
    const selectFaqs = jest.fn();
    const execute = jest.fn();
    const record = jest.fn();
    beforeEach(async () => {
        record.mockReset().mockResolvedValue(undefined);
        selectFaqs.mockReset().mockResolvedValue(['faq-1']);
        execute
            .mockReset()
            .mockResolvedValue([{ faqId: 'faq-1', question: '입양 방법', answer: '신청 후 채팅으로 상담합니다.' }]);
        const module = await Test.createTestingModule({
            controllers: [HomeSupportController],
            providers: [
                AnswerSupportInquiryUseCase,
                SupportRateLimitGuard,
                SubmitSupportFeedbackUseCase,
                { provide: SUPPORT_LOG_PORT, useValue: { record } },
                { provide: GetFaqsUseCase, useValue: { execute } },
                { provide: SUPPORT_AGENT_PORT, useValue: { selectFaqs } },
            ],
        }).compile();
        app = module.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
        await app.init();
    });
    afterEach(async () => {
        await app.close();
    });
    const send = (question = '어떻게 입양해요?', userType = 'adopter') =>
        request(app.getHttpServer()).post('/v2/home/support/inquiry').send({ question, userType });

    it('AI 선택을 FAQ 원문으로 반환하고 역할을 전달한다', async () => {
        const result = await send('  입양 방법  ', 'breeder').expect(200);
        expect(dataOf(result).sources[0].answer).toBe('신청 후 채팅으로 상담합니다.');
        expect(dataOf(result).needsHumanSupport).toBe(false);
        expect(execute).toHaveBeenCalledWith('breeder');
        expect(selectFaqs).toHaveBeenCalledWith('입양 방법', expect.any(Array));
    });
    it.each(['', '   ', 'x'.repeat(2001)])('빈 질문과 과대 요청 차단', async (question) => {
        await send(question).expect(400);
        expect(selectFaqs).not.toHaveBeenCalled();
    });
    it('허용되지 않은 이용자 유형 차단', async () => {
        await send('질문', 'admin').expect(400);
    });
    it('모델이 존재하지 않는 출처를 만들면 실패한다', async () => {
        selectFaqs.mockResolvedValue(['invented']);
        await send().expect(503);
    });
    it('근거가 없으면 담당자 안내를 반환한다', async () => {
        selectFaqs.mockResolvedValue([]);
        const result = await send().expect(200);
        expect(dataOf(result)).toEqual({ sources: [], needsHumanSupport: true });
        expect(record).toHaveBeenCalledWith(expect.objectContaining({ kind: 'ai_no_match', userType: 'adopter' }));
        expect(JSON.stringify(record.mock.calls)).not.toContain('어떻게 입양해요');
    });
    it('Agent 장애는 정상 답변으로 위장하지 않는다', async () => {
        selectFaqs.mockRejectedValue(new ServiceUnavailableException());
        await send().expect(503);
        expect(record).toHaveBeenCalledWith(expect.objectContaining({ kind: 'ai_error' }));
    });
    it('동일 출처 중복 제거', async () => {
        selectFaqs.mockResolvedValue(['faq-1', 'faq-1']);
        const result = await send().expect(200);
        expect(dataOf(result).sources).toHaveLength(1);
    });
    it('한 IP의 여섯 번째 요청을 제한한다', async () => {
        for (let i = 0; i < 5; i++) await send().expect(200);
        await send().expect(429);
        expect(selectFaqs).toHaveBeenCalledTimes(5);
    });

    it('AI 관측 저장 장애가 FAQ 응답을 막지 않는다', async () => {
        selectFaqs.mockResolvedValue([]);
        record.mockRejectedValue(new Error('database unavailable'));
        await send().expect(200);
    });

    it('피드백을 저장한 뒤 접수번호를 반환하고 AI 호출은 하지 않는다', async () => {
        const response = await request(app.getHttpServer())
            .post('/v2/home/support/feedback')
            .send({ question: '  오류 제보  ', userType: 'breeder' })
            .expect(200);
        const receiptId = (response.body as { data: { receiptId: string } }).data.receiptId;
        expect(receiptId).toMatch(/^[a-f0-9-]{36}$/);
        expect(record).toHaveBeenCalledWith({
            eventId: receiptId,
            kind: 'feedback',
            message: '오류 제보',
            userType: 'breeder',
        });
        expect(selectFaqs).not.toHaveBeenCalled();
    });

    it('피드백 저장 실패를 접수 성공으로 표시하지 않는다', async () => {
        record.mockRejectedValue(new Error('database unavailable'));
        await request(app.getHttpServer())
            .post('/v2/home/support/feedback')
            .send({ question: '오류 제보', userType: 'adopter' })
            .expect(503);
    });

    it('피드백도 검증과 요청 제한을 적용한다', async () => {
        await request(app.getHttpServer())
            .post('/v2/home/support/feedback')
            .send({ question: '', userType: 'admin' })
            .expect(400);
        expect(record).not.toHaveBeenCalled();
        for (let i = 0; i < 4; i++) await send().expect(200);
        await request(app.getHttpServer())
            .post('/v2/home/support/feedback')
            .send({ question: '제보', userType: 'adopter' })
            .expect(429);
    });
});
