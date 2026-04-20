import { Injectable } from '@nestjs/common';

import type { AdopterProfileResult } from '../../application/types/adopter-result.type';
import type { AdopterProfileRecord } from '../../application/ports/adopter-profile.port';
import type { AdopterApplicationEmbeddedRecord } from '../../types/adopter-application.type';
import type { AdopterFavoriteRecord, AdopterWrittenReviewEmbeddedRecord } from '../../types/adopter-profile.type';

@Injectable()
export class AdopterProfileResultMapperService {
    toResult(adopter: AdopterProfileRecord): AdopterProfileResult {
        return {
            adopterId: adopter._id.toString(),
            emailAddress: adopter.emailAddress,
            nickname: adopter.nickname,
            phoneNumber: adopter.phoneNumber || '',
            profileImageFileName: adopter.profileImageFileName,
            accountStatus: adopter.accountStatus,
            authProvider: adopter.socialAuthInfo?.authProvider || 'local',
            marketingAgreed: adopter.marketingAgreed ?? false,
            favoriteBreederList: (adopter.favoriteBreederList || []).map((fav: AdopterFavoriteRecord) => ({
                breederId: fav.favoriteBreederId,
                breederName: fav.breederName,
                addedAt: fav.addedAt,
                breederProfileImageUrl: fav.breederProfileImageUrl,
                breederLocation: fav.breederLocation,
            })),
            adoptionApplicationList: (adopter.adoptionApplicationList || []).map((app: AdopterApplicationEmbeddedRecord) => ({
                applicationId: app.applicationId,
                breederId: app.targetBreederId,
                petId: app.targetPetId,
                applicationStatus: app.applicationStatus,
                appliedAt: app.appliedAt,
            })),
            writtenReviewList: (adopter.writtenReviewList || []).map((review: AdopterWrittenReviewEmbeddedRecord) => ({
                reviewId: review.reviewId,
                breederId: review.targetBreederId,
                rating: review.overallRating,
                content: review.reviewContent,
                createdAt: review.createdAt,
            })),
            createdAt: adopter.createdAt,
            updatedAt: adopter.updatedAt,
        };
    }
}
