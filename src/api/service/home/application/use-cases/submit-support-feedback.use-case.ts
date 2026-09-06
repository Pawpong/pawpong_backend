import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SUPPORT_LOG_PORT, type SupportLogPort } from '../ports/support-log.port';

@Injectable()
export class SubmitSupportFeedbackUseCase {
    constructor(@Inject(SUPPORT_LOG_PORT) private readonly log: SupportLogPort) {}
    async execute(message: string, userType: string) {
        const receiptId = randomUUID();
        try {
            await this.log.record({ eventId: receiptId, kind: 'feedback', message, userType });
        } catch {
            throw new ServiceUnavailableException(
                '피드백을 접수하지 못했습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.',
            );
        }
        return { receiptId };
    }
}
