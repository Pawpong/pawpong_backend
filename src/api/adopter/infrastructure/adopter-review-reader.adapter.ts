import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import type {
    AdopterReviewDetailRecord,
    AdopterReviewListRecord,
} from '../application/ports/adopter-review-reader.port';
import { AdopterReviewReaderPort } from '../application/ports/adopter-review-reader.port';
import { AdopterReviewRepository } from '../repository/adopter-review.repository';

@Injectable()
export class AdopterReviewReaderAdapter extends AdopterReviewReaderPort {
    constructor(
        private readonly adopterReviewRepository: AdopterReviewRepository,
        private readonly storageService: StorageService,
    ) {
        super();
    }

    countByAdopterId(adopterId: string): Promise<number> {
        return this.adopterReviewRepository.countByAdopterId(adopterId);
    }

    async findPagedByAdopterId(adopterId: string, page: number, limit: number): Promise<AdopterReviewListRecord[]> {
        const reviews = await this.adopterReviewRepository.findPagedByAdopterId(adopterId, page, limit);

        return reviews.map((review: any) => {
            const breeder = review.breederId;
            return {
                reviewId: review._id.toString(),
                applicationId: review.applicationId?.toString() || null,
                breederId: breeder?._id?.toString() || null,
                breederNickname: breeder?.nickname || null,
                breederProfileImageFileName: breeder?.profileImageFileName
                    ? this.storageService.generateSignedUrlSafe(breeder.profileImageFileName, 60) || null
                    : null,
                breederLevel: breeder?.verification?.level || null,
                breedingPetType: breeder?.petType || null,
                content: review.content,
                reviewType: review.type,
                writtenAt: review.writtenAt,
            };
        });
    }

    async findDetailByAdopterId(adopterId: string, reviewId: string): Promise<AdopterReviewDetailRecord | null> {
        const review = await this.adopterReviewRepository.findDetailByAdopterId(adopterId, reviewId);

        if (!review) {
            return null;
        }

        const breeder = review.breederId as any;

        return {
            reviewId: review._id.toString(),
            breederNickname: breeder?.nickname || null,
            breederProfileImageFileName: breeder?.profileImageFileName
                ? this.storageService.generateSignedUrlSafe(breeder.profileImageFileName, 60) || null
                : null,
            breederLevel: breeder?.verification?.level || null,
            breedingPetType: breeder?.petType || null,
            content: review.content,
            reviewType: review.type,
            writtenAt: review.writtenAt,
            isVisible: review.isVisible,
        };
    }
}
