import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ApplicationStatus } from '../../../../common/enum/user.enum';
import { ReviewCreateResponseDto } from '../../dto/response/review-create-response.dto';
import { ADOPTER_PROFILE_PORT } from '../ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from '../ports/adopter-breeder-reader.port';
import type { AdopterProfilePort } from '../ports/adopter-profile.port';
import type { AdopterBreederReaderPort } from '../ports/adopter-breeder-reader.port';
import { AdopterReviewCommandPort } from '../ports/adopter-review-command.port';
import { AdopterReviewNotifierPort } from '../ports/adopter-review-notifier.port';
import { AdopterReviewCreateResponseFactoryService } from '../../domain/services/adopter-review-create-response-factory.service';
import type { AdopterReviewCreateCommand } from '../types/adopter-review-command.type';

@Injectable()
export class CreateAdopterReviewUseCase {
    constructor(
        @Inject(ADOPTER_PROFILE_PORT)
        private readonly adopterProfilePort: AdopterProfilePort,
        @Inject(ADOPTER_BREEDER_READER_PORT)
        private readonly adopterBreederReaderPort: AdopterBreederReaderPort,
        private readonly adopterReviewCommandPort: AdopterReviewCommandPort,
        private readonly adopterReviewNotifierPort: AdopterReviewNotifierPort,
        private readonly adopterReviewCreateResponseFactoryService: AdopterReviewCreateResponseFactoryService,
    ) {}

    async execute(userId: string, dto: AdopterReviewCreateCommand): Promise<ReviewCreateResponseDto> {
        const adopter = await this.adopterProfilePort.findById(userId);
        if (!adopter) {
            throw new BadRequestException('입양자 정보를 찾을 수 없습니다.');
        }

        const application = await this.adopterReviewCommandPort.findApplicationById(dto.applicationId);
        if (!application) {
            throw new BadRequestException('해당 입양 신청을 찾을 수 없습니다.');
        }

        if (application.adopterId.toString() !== userId) {
            throw new BadRequestException('본인의 입양 신청에 대해서만 후기를 작성할 수 있습니다.');
        }

        if (application.status !== ApplicationStatus.CONSULTATION_COMPLETED) {
            throw new BadRequestException(
                '상담이 완료된 신청에 대해서만 후기를 작성할 수 있습니다. 현재 상태: ' + application.status,
            );
        }

        const breeder = await this.adopterBreederReaderPort.findById(application.breederId.toString());
        if (!breeder) {
            throw new BadRequestException('해당 브리더를 찾을 수 없습니다.');
        }

        const savedReview = await this.adopterReviewCommandPort.create({
            applicationId: dto.applicationId,
            breederId: application.breederId.toString(),
            adopterId: userId,
            type: dto.reviewType,
            content: dto.content,
            writtenAt: new Date(),
            isVisible: true,
        });

        await this.adopterReviewCommandPort.incrementBreederReviewCount(application.breederId.toString());
        await this.adopterReviewNotifierPort.notifyBreederOfNewReview(application.breederId.toString());

        return this.adopterReviewCreateResponseFactoryService.create(savedReview);
    }
}
