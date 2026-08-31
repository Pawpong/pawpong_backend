import type { PageResult } from '../../../../../common/types/page-result.type';
import type {
    AdopterApplicationAnswerValue,
    AdopterApplicationStandardResponsesRecord,
} from '../../types/adopter-application.type';

export type AdopterProfileFavoriteResult = {
    breederId: string;
    breederName: string;
    addedAt: Date;
    breederProfileImageUrl?: string;
    breederLocation?: string;
};

export type AdopterProfileApplicationResult = {
    applicationId: string;
    breederId: string;
    petId: string;
    applicationStatus: string;
    appliedAt: Date;
};

export type AdopterProfileWrittenReviewResult = {
    reviewId: string;
    breederId: string;
    rating: number;
    content: string;
    createdAt: Date;
};

/** 가입 시 받은 입양 상담 사전 정보 (조사 양식) */
export type AdopterCounselDefaultProfileResult = {
    selfIntroduction?: string;
    dailyAbsenceHours?: string;
    livingSpaceDescription?: string;
    counselPrivacyAgreedAt?: Date;
};

export type AdopterProfileResult = {
    adopterId: string;
    emailAddress: string;
    nickname: string;
    phoneNumber: string;
    profileImageFileName?: string;
    accountStatus: string;
    authProvider: string;
    marketingAgreed: boolean;
    favoriteBreederList: AdopterProfileFavoriteResult[];
    adoptionApplicationList: AdopterProfileApplicationResult[];
    writtenReviewList: AdopterProfileWrittenReviewResult[];
    /**
     * 가입 시 조사 양식으로 받은 상담 사전 정보.
     * 건너뛴 사용자는 null 이라, 클라이언트가 조사 완료 여부를 서버 기준으로 판정할 수 있다.
     */
    counselDefaultProfile: AdopterCounselDefaultProfileResult | null;
    createdAt: Date;
    updatedAt: Date;
};

export type AdopterApplicationCustomResponseResult = {
    questionId: string;
    questionLabel: string;
    questionType: string;
    answer: AdopterApplicationAnswerValue;
};

export type AdopterApplicationListItemResult = {
    applicationId: string;
    reviewId: string | null;
    breederId: string;
    adopterId: string | null;
    breederName: string;
    petId?: string;
    petName?: string;
    status: string;
    appliedAt: string;
    processedAt?: string;
    profileImage?: string | null;
    animalType: 'cat' | 'dog';
    applicationDate: string;
    customResponses?: AdopterApplicationCustomResponseResult[];
};

export type AdopterApplicationPageResult = PageResult<AdopterApplicationListItemResult>;

export type AdopterApplicationDetailResult = {
    applicationId: string;
    reviewId: string | null;
    breederId: string;
    breederName: string;
    petId?: string;
    petName?: string;
    status: string;
    standardResponses?: AdopterApplicationStandardResponsesRecord;
    customResponses: AdopterApplicationCustomResponseResult[];
    appliedAt: string;
    processedAt?: string;
    breederNotes?: string;
};

export type AdopterApplicationCreateResult = {
    applicationId: string;
    breederId: string;
    breederName: string;
    petId?: string;
    petName?: string;
    status: string;
    appliedAt: string;
    message: string;
};

export type AdopterReviewItemResult = {
    reviewId: string;
    applicationId: string | null;
    breederId: string | null;
    breederNickname: string;
    breederProfileImage: string | null;
    breedingPetType: string;
    content: string;
    reviewType: string;
    writtenAt: Date;
};

export type AdopterReviewPageResult = PageResult<AdopterReviewItemResult>;

export type AdopterReviewDetailResult = {
    reviewId: string;
    applicationId: string | null;
    breederId: string | null;
    breederNickname: string;
    breederProfileImage: string | null;
    breedingPetType: string;
    content: string;
    reviewType: string;
    writtenAt: Date;
    isVisible: boolean;
};

export type AdopterReviewCreateResult = {
    reviewId: string;
    applicationId: string;
    breederId: string;
    reviewType: string;
    writtenAt: string;
};

export type AdopterReviewReportResult = {
    message: string;
};

export type AdopterProfileUpdateResult = {
    message: string;
};

export type AdopterFavoriteCommandResult = {
    message: string;
};

export type AdopterAccountDeleteResult = {
    adopterId: string;
    deletedAt: string;
    message: string;
};

export type AdopterReportCreateResult = {
    reportId: string;
    message: string;
};
