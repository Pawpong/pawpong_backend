import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { GetFaqsUseCase } from './get-faqs.use-case';
import { SUPPORT_AGENT_PORT, type SupportAgentPort } from '../ports/support-agent.port';

@Injectable()
export class AnswerSupportInquiryUseCase {
    constructor(
        private readonly getFaqs: GetFaqsUseCase,
        @Inject(SUPPORT_AGENT_PORT) private readonly agent: SupportAgentPort,
    ) {}

    /** 모델은 FAQ 선택만 수행하고 사용자에게는 서버의 현행 원문만 반환한다. */
    async execute(question: string, userType: string) {
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
