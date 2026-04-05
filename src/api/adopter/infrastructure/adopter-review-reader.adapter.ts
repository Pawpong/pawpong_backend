import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { StorageService } from '../../../common/storage/storage.service';
import { BreederReview, BreederReviewDocument } from '../../../schema/breeder-review.schema';
import type {
    AdopterReviewDetailRecord,
    AdopterReviewListRecord,
} from '../application/ports/adopter-review-reader.port';
import { AdopterReviewReaderPort } from '../application/ports/adopter-review-reader.port';

@Injectable()
export class AdopterReviewReaderAdapter extends AdopterReviewReaderPort {
    constructor(
        @InjectModel(BreederReview.name)
        private readonly breederReviewModel: Model<BreederReviewDocument>,
        private readonly storageService: StorageService,
    ) {
        super();
    }

    countByAdopterId(adopterId: string): Promise<number> {
        return this.breederReviewModel.countDocuments({ adopterId }).exec();
    }

    async findPagedByAdopterId(adopterId: string, page: number, limit: number): Promise<AdopterReviewListRecord[]> {
        const skip = (page - 1) * limit;
        const reviews = await this.breederReviewModel
            .find({ adopterId })
            .sort({ writtenAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('breederId', 'nickname profileImageFileName verification.level petType')
            .lean()
            .exec();

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
        const review = await this.breederReviewModel
            .findOne({ _id: reviewId, adopterId })
            .populate('breederId', 'nickname profileImageFileName verification.level petType')
            .lean()
            .exec();

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
