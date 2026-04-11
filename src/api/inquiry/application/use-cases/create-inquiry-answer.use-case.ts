import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { InquiryCommandPolicyService } from '../../domain/services/inquiry-command-policy.service';
import { INQUIRY_COMMAND_PORT, type InquiryCommandPort } from '../ports/inquiry-command.port';
import type { InquiryAnswerCreateCommand } from '../types/inquiry-command.type';

@Injectable()
export class CreateInquiryAnswerUseCase {
    constructor(
        @Inject(INQUIRY_COMMAND_PORT)
        private readonly inquiryCommand: InquiryCommandPort,
        private readonly inquiryCommandPolicyService: InquiryCommandPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(inquiryId: string, breederId: string, dto: InquiryAnswerCreateCommand): Promise<void> {
        this.logger.logStart('createAnswer', '답변 작성', { inquiryId, breederId });

        if (!inquiryId || !breederId) {
            throw new BadRequestException('필수 정보가 누락되었습니다.');
        }

        const inquiry = await this.inquiryCommand.findInquiryById(inquiryId);
        if (!inquiry) {
            throw new BadRequestException('해당 문의를 찾을 수 없습니다.');
        }

        this.inquiryCommandPolicyService.ensureInquiryAnswerable(inquiry, breederId);

        const breeder = await this.inquiryCommand.findBreederInfo(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const now = new Date();
        await this.inquiryCommand.appendAnswer(
            inquiryId,
            this.inquiryCommandPolicyService.buildAnswerData(breederId, breeder, dto),
            now,
        );

        this.logger.logSuccess('createAnswer', '답변 작성 완료', { inquiryId, breederId });
    }
}
