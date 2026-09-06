/* eslint @typescript-eslint/unbound-method: "off" -- Jest mock 호출 이력 matcher에 메서드 참조를 전달함. */
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SupportDiscordWorker } from '../../infrastructure/support-discord.worker';
import { SupportEventRepository } from '../../repository/support-event.repository';
import type { SupportEventRecord } from '../../../../../schema/support-event.schema';

jest.mock('axios');
const post = jest.mocked(axios.post);

describe('지원 알림 outbox 전달', () => {
    const event: SupportEventRecord = {
        eventId: 'receipt-1',
        status: 'open',
        assigneeId: '',
        revision: 0,
        history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        kind: 'feedback',
        userType: 'adopter',
        environment: 'production',
        message: '오류 user@example.com 010-1234-5678 @everyone https://example.com/?token=secret',
        deliveryStatus: 'pending',
        attempts: 1,
        sourceIds: [],
        nextAttemptAt: new Date(),
    };
    const repository = { claim: jest.fn(), delivered: jest.fn(), retry: jest.fn() };
    let config: Record<string, string>;
    let worker: SupportDiscordWorker;

    beforeEach(() => {
        jest.resetAllMocks();
        config = {
            NODE_ENV: 'production',
            DISCORD_SUPPORT_WEBHOOK_URL: 'https://discord.test/voc',
            DISCORD_ERROR_WEBHOOK_URL: 'https://discord.test/error',
        };
        repository.claim.mockResolvedValueOnce(event).mockResolvedValue(null);
        worker = new SupportDiscordWorker(
            repository as unknown as SupportEventRepository,
            { get: (key: string) => config[key] } as ConfigService,
        );
    });

    it('운영 피드백을 마스킹하여 보내고 전달 완료를 기록한다', async () => {
        post.mockResolvedValue({ status: 204 });
        await worker.flush();
        expect(post).toHaveBeenCalledWith(
            config.DISCORD_SUPPORT_WEBHOOK_URL,
            expect.objectContaining({ allowed_mentions: { parse: [] } }),
            { timeout: 8000, maxRedirects: 0 },
        );
        const payload = JSON.stringify(post.mock.calls[0][1]);
        for (const secret of ['user@example.com', '010-1234-5678', '@everyone', 'token=secret'])
            expect(payload).not.toContain(secret);
        expect(repository.delivered).toHaveBeenCalledWith('receipt-1', expect.any(String));
    });

    it('AI 장애를 기존 서버 오류 채널로 보낸다', async () => {
        repository.claim
            .mockReset()
            .mockResolvedValueOnce({ ...event, kind: 'ai_error', message: undefined })
            .mockResolvedValue(null);
        await worker.flush();
        expect(post.mock.calls[0][0]).toBe(config.DISCORD_ERROR_WEBHOOK_URL);
    });

    it('웹후크 실패 시 완료 처리하지 않고 DB 재시도를 예약한다', async () => {
        post.mockRejectedValue(new Error('network failed'));
        await worker.flush();
        expect(repository.delivered).not.toHaveBeenCalled();
        expect(repository.retry).toHaveBeenCalledWith('receipt-1', expect.any(String), 1);
    });

    it('설정이 없으면 유실시키지 않고 재시도한다', async () => {
        delete config.DISCORD_SUPPORT_WEBHOOK_URL;
        await worker.flush();
        expect(post).not.toHaveBeenCalled();
        expect(repository.retry).toHaveBeenCalled();
    });

    it('개발 환경에서는 운영 채널에 전송하지 않는다', async () => {
        config.NODE_ENV = 'development';
        await worker.flush();
        expect(repository.claim).not.toHaveBeenCalled();
        expect(post).not.toHaveBeenCalled();
    });
});
