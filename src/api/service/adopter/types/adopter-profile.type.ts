import type { AdopterApplicationEmbeddedRecord } from './adopter-application.type';

export type AdopterFavoriteRecord = {
    favoriteBreederId: string;
    breederName: string;
    breederProfileImageUrl?: string;
    breederLocation?: string;
    addedAt: Date;
};

export type AdopterWrittenReviewEmbeddedRecord = {
    reviewId: string;
    targetBreederId: string;
    overallRating: number;
    reviewContent: string;
    createdAt: Date;
};

export type AdopterProfileUpdateRecord = {
    nickname?: string;
    /**
     * 상담 사전 정보는 점 표기로 부분 갱신한다.
     * 객체를 통째로 $set 하면 함께 저장된 counselPrivacyAgreedAt(가입 시 동의 시각)이 지워진다.
     */
    'counselDefaultProfile.selfIntroduction'?: string;
    'counselDefaultProfile.dailyAbsenceHours'?: string;
    'counselDefaultProfile.livingSpaceDescription'?: string;
    phoneNumber?: string;
    profileImageFileName?: string;
    marketingConsent?: boolean;
    accountStatus?: string;
    deletedAt?: Date;
    deleteReason?: string;
    deleteReasonDetail?: string | null;
    updatedAt?: Date;
};

export type AdopterProfileApplicationRecord = AdopterApplicationEmbeddedRecord;
