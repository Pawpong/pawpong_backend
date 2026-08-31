import { Injectable } from '@nestjs/common';

import type {
    AdopterCounselDefaultProfileResult,
    AdopterProfileResult,
} from '../../application/types/adopter-result.type';
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
            counselDefaultProfile: this.toCounselDefaultProfile(adopter.counselDefaultProfile),
            favoriteBreederList: (adopter.favoriteBreederList || []).map((fav: AdopterFavoriteRecord) => ({
                breederId: fav.favoriteBreederId,
                breederName: fav.breederName,
                addedAt: fav.addedAt,
                breederProfileImageUrl: fav.breederProfileImageUrl,
                breederLocation: fav.breederLocation,
            })),
            adoptionApplicationList: (adopter.adoptionApplicationList || []).map(
                (app: AdopterApplicationEmbeddedRecord) => ({
                    applicationId: app.applicationId,
                    breederId: app.targetBreederId,
                    petId: app.targetPetId,
                    applicationStatus: app.applicationStatus,
                    appliedAt: app.appliedAt,
                }),
            ),
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

    /**
     * 조사 양식 완료 여부를 내용 기준으로 판정한다.
     *
     * 스키마가 `default: () => ({})` 라 조사를 건너뛴 사용자에게도 빈 서브도큐먼트가 생긴다.
     * 따라서 필드 존재 여부로는 완료·건너뜀을 구분할 수 없다.
     * 실제로 입력된 값이나 동의 시각이 하나라도 있을 때만 완료로 보고, 그 외에는 null 을 준다.
     * (기존 문서도 그대로 판정되므로 마이그레이션이 필요 없다)
     */
    private toCounselDefaultProfile(
        counsel: AdopterProfileRecord['counselDefaultProfile'],
    ): AdopterCounselDefaultProfileResult | null {
        if (!counsel) {
            return null;
        }

        const hasAnyAnswer = Boolean(
            counsel.selfIntroduction?.trim() ||
            counsel.dailyAbsenceHours?.trim() ||
            counsel.livingSpaceDescription?.trim() ||
            counsel.counselPrivacyAgreedAt,
        );

        return hasAnyAnswer ? counsel : null;
    }
}
