import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { InquiryCommandPolicyService } from '../../domain/services/inquiry-command-policy.service';
import { INQUIRY_COMMAND_PORT, type InquiryCommandPort } from '../ports/inquiry-command.port';

@Injectable()
export class DeleteInquiryUseCase {
    constructor(
        @Inject(INQUIRY_COMMAND_PORT)
        private readonly inquiryCommand: InquiryCommandPort,
        private readonly inquiryCommandPolicyService: InquiryCommandPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(inquiryId: string, userId: string): Promise<void> {
        this.logger.logStart('deleteInquiry', '문의 삭제', { inquiryId, userId });

        const inquiry = await this.inquiryCommand.findInquiryById(inquiryId);
        if (!inquiry) {
            throw new DomainNotFoundError('해당 문의를 찾을 수 없습니다.');
        }

        this.inquiryCommandPolicyService.ensureAuthorOwnsInquiry(inquiry, userId, '본인이 작성한 문의만 삭제할 수 있습니다.');
        this.inquiryCommandPolicyService.ensureNoAnswers(inquiry, '답변이 달린 문의는 삭제할 수 없습니다.');

        await this.inquiryCommand.delete(inquiryId);
        this.logger.logSuccess('deleteInquiry', '문의 삭제 완료', { inquiryId });
    }
}
