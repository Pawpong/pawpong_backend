import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { InquiryCommandPolicyService } from '../../domain/services/inquiry-command-policy.service';
import { INQUIRY_COMMAND, type InquiryCommandPort } from '../ports/inquiry-command.port';
import type { InquiryCreateCommand } from '../types/inquiry-command.type';

@Injectable()
export class CreateInquiryUseCase {
    constructor(
        @Inject(INQUIRY_COMMAND)
        private readonly inquiryCommand: InquiryCommandPort,
        private readonly inquiryCommandPolicyService: InquiryCommandPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(userId: string, dto: InquiryCreateCommand): Promise<{ inquiryId: string }> {
        this.logger.logStart('createInquiry', '문의 작성', { userId, type: dto.type });

        if (!userId) {
            throw new BadRequestException('사용자 정보가 올바르지 않습니다.');
        }

        const adopterNickname = await this.inquiryCommand.findAdopterNickname(userId);
        if (!adopterNickname) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        if (dto.type === 'direct') {
            this.inquiryCommandPolicyService.ensureTargetBreederId(dto.targetBreederId);

            const breederExists = await this.inquiryCommand.existsBreeder(dto.targetBreederId as string);
            if (!breederExists) {
                throw new BadRequestException('대상 브리더를 찾을 수 없습니다.');
            }
        }

        const result = await this.inquiryCommand.create({
            authorId: userId,
            authorNickname: adopterNickname,
            title: dto.title,
            content: dto.content,
            type: dto.type,
            animalType: dto.animalType,
            targetBreederId: dto.targetBreederId,
            imageUrls: dto.imageUrls || [],
        });

        this.logger.logSuccess('createInquiry', '문의 작성 완료', result);
        return result;
    }
}
