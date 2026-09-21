import { Injectable } from '@nestjs/common';

import type {
    AdopterCounselDefaultProfileResult,
    AdopterProfileResult,
} from '../../application/types/adopter-result.type';
import type { AdopterProfileRecord } from '../../application/ports/adopter-profile.port';
import type { AdopterApplicationEmbeddedRecord } from '../../types/adopter-application.type';
import type { AdopterBreederRecord } from '../../types/adopter-breeder.type';
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
            favoriteBreederList: this.toFavoriteResults(adopter.favoriteBreederList),
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
     * 브리더가 입양 신청 화면에 들어올 때 쓰는 매핑.
     *
     * 응답 계약(AdopterProfileResult)은 그대로 두고, 브리더에게 없는 입양자 고유 값만 빈 기본값으로 채운다.
     * counselDefaultProfile 은 null 이다 — 브리더는 가입 시 상담 조사 양식을 받지 않으므로
     * 프론트의 "조사 건너뜀" 분기를 그대로 타야 한다. undefined 로 두면 그 분기가 터진다.
     *
     * Breeder 는 User 를 상속하므로 이메일·닉네임·계정상태·소셜 정보는 브리더 문서에도 있다.
     * 다만 브리더의 표시 이름은 name(업체명)이라 nickname 이 비면 그걸 쓴다.
     */
    toResultFromBreeder(breeder: AdopterBreederRecord): AdopterProfileResult {
        const fallbackTimestamp = breeder.createdAt ?? breeder.updatedAt;

        return {
            adopterId: breeder._id.toString(),
            emailAddress: breeder.emailAddress || '',
            nickname: breeder.nickname || breeder.name || '',
            phoneNumber: breeder.phoneNumber || '',
            profileImageFileName: breeder.profileImageFileName ?? undefined,
            accountStatus: breeder.accountStatus || 'active',
            authProvider: breeder.socialAuthInfo?.authProvider || 'local',
            marketingAgreed: breeder.marketingAgreed ?? false,
            counselDefaultProfile: null,
            favoriteBreederList: this.toFavoriteResults(breeder.favoriteBreederList),
            // 입양자 전용 이력 — 브리더 문서에는 없으므로 빈 배열로 계약을 지킨다.
            adoptionApplicationList: [],
            writtenReviewList: [],
            createdAt: breeder.createdAt ?? fallbackTimestamp ?? new Date(),
            updatedAt: breeder.updatedAt ?? fallbackTimestamp ?? new Date(),
        };
    }

    private toFavoriteResults(
        favorites: AdopterFavoriteRecord[] | undefined,
    ): AdopterProfileResult['favoriteBreederList'] {
        return (favorites || []).map((fav: AdopterFavoriteRecord) => ({
            breederId: fav.favoriteBreederId,
            breederName: fav.breederName,
            addedAt: fav.addedAt,
            breederProfileImageUrl: fav.breederProfileImageUrl,
            breederLocation: fav.breederLocation,
        }));
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
