import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { InquiryCommandPolicyService } from '../../domain/services/inquiry-command-policy.service';
import { INQUIRY_COMMAND_PORT, type InquiryCommandPort } from '../ports/inquiry-command.port';
import type { InquiryUpdateCommand } from '../types/inquiry-command.type';

@Injectable()
export class UpdateInquiryUseCase {
    constructor(
        @Inject(INQUIRY_COMMAND_PORT)
        private readonly inquiryCommand: InquiryCommandPort,
        private readonly inquiryCommandPolicyService: InquiryCommandPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(inquiryId: string, userId: string, dto: InquiryUpdateCommand): Promise<void> {
        this.logger.logStart('updateInquiry', '문의 수정', { inquiryId, userId });

        const inquiry = await this.inquiryCommand.findInquiryById(inquiryId);
        if (!inquiry) {
            throw new DomainNotFoundError('해당 문의를 찾을 수 없습니다.');
        }

        this.inquiryCommandPolicyService.ensureAuthorOwnsInquiry(
            inquiry,
            userId,
            '본인이 작성한 문의만 수정할 수 있습니다.',
        );
        this.inquiryCommandPolicyService.ensureNoAnswers(inquiry, '답변이 달린 문의는 수정할 수 없습니다.');

        const updateData: { title?: string; content?: string; imageUrls?: string[] } = {};
        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.content !== undefined) updateData.content = dto.content;
        if (dto.imageUrls !== undefined) updateData.imageUrls = dto.imageUrls;

        await this.inquiryCommand.update(inquiryId, updateData);
        this.logger.logSuccess('updateInquiry', '문의 수정 완료', { inquiryId });
    }
}
