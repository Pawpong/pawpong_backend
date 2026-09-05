import { Inject, Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, type Observable, timeout } from 'rxjs';
import { SUPPORT_AGENT_CLIENT, type SupportAgentPort, type SupportFaq } from '../application/ports/support-agent.port';

interface SupportGrpcService {
    answerSupportInquiry(request: { question: string; faqs: SupportFaq[] }): Observable<{ faqIds?: string[] }>;
}

@Injectable()
export class SupportAgentGrpcAdapter implements SupportAgentPort, OnModuleInit {
    private service: SupportGrpcService;
    constructor(@Inject(SUPPORT_AGENT_CLIENT) private readonly client: ClientGrpc) {}

    /** 기존 내부 Agent 서비스에 연결한다. */
    onModuleInit() {
        this.service = this.client.getService<SupportGrpcService>('AiAgentService');
    }

    /** 장애·구버전 Agent는 503으로 반환해 메일 문의를 계속 사용할 수 있게 한다. */
    async selectFaqs(question: string, faqs: SupportFaq[]): Promise<string[]> {
        try {
            const result = await firstValueFrom(
                this.service.answerSupportInquiry({ question, faqs }).pipe(timeout(20_000)),
            );
            return result.faqIds ?? [];
        } catch {
            throw new ServiceUnavailableException(
                'AI 안내를 불러오지 못했습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.',
            );
        }
    }
}
