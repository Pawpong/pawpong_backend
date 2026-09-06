import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SUPPORT_LOG_PORT, type SupportLogPort, type SupportEvent } from '../ports/support-log.port';
import { GetFaqsUseCase } from './get-faqs.use-case';
import { SUPPORT_AGENT_PORT, type SupportAgentPort } from '../ports/support-agent.port';

@Injectable()
export class AnswerSupportInquiryUseCase {
    private readonly logger = new Logger(AnswerSupportInquiryUseCase.name);
    constructor(
        private readonly getFaqs: GetFaqsUseCase,
        @Inject(SUPPORT_AGENT_PORT) private readonly agent: SupportAgentPort,
        @Inject(SUPPORT_LOG_PORT) private readonly log: SupportLogPort,
    ) {}

    /** 모델은 FAQ 선택만 수행하고 사용자에게는 서버의 현행 원문만 반환한다. */
    async execute(question: string, userType: string) {
        const eventId = randomUUID();
        const started = Date.now();
        try {
            const result = await this.answer(question, userType);
            const durationMs = Date.now() - started;
            this.logger.log(
                JSON.stringify({
                    event: 'support_ai_answer',
                    eventId,
                    userType,
                    durationMs,
                    outcome: result.needsHumanSupport ? 'no_match' : 'answered',
                    sourceIds: result.sources.map((source) => source.faqId),
                }),
            );
            if (result.needsHumanSupport) {
                await this.record({ eventId, kind: 'ai_no_match', userType, durationMs });
            }
            return result;
        } catch (error) {
            this.logger.warn(
                JSON.stringify({ event: 'support_ai_error', eventId, userType, durationMs: Date.now() - started }),
            );
            await this.record({ eventId, kind: 'ai_error', userType, durationMs: Date.now() - started });
            throw error;
        }
    }

    private async record(event: SupportEvent) {
        try {
            await this.log.record(event);
        } catch {
            this.logger.error(JSON.stringify({ event: 'support_audit_unavailable', eventId: event.eventId }));
        }
    }

    private async answer(question: string, userType: string) {
        const faqs = (await this.getFaqs.execute(userType)).slice(0, 60);
        const ids = faqs.length ? await this.agent.selectFaqs(question, faqs) : [];
        if (ids.length > 3 || ids.some((id) => !faqs.some((faq) => faq.faqId === id))) {
            throw new ServiceUnavailableException('AI 안내를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
        const sources = [...new Set(ids)].map((id) => {
            const faq = faqs.find((item) => item.faqId === id)!;
            return { faqId: faq.faqId, question: faq.question, answer: faq.answer };
        });
        return { sources, needsHumanSupport: sources.length === 0 };
    }
}
