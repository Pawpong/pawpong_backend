import type { RegisterAdopterAuthSignupResult } from '../../../application/types/auth-signup.type';

export type TermsAgreementInput = {
    code: string;
    version: string;
    agreedAt?: string;
};

export type CounselDefaultProfileInput = {
    selfIntroduction: string;
    dailyAbsenceHours?: string;
    livingSpaceDescription?: string;
    counselPrivacyAgreed: boolean;
};

/**
 * v2 입양자 가입 커맨드
 * v1 RegisterAdopterAuthSignupCommand 대비 추가 필드:
 * - realName: 온보딩4 실명
 * - interestedBreedIds: 온보딩3 관심 품종 ID 배열
 * - counselDefaultProfile: 온보딩4 상담 사전 정보
 * - termsAgreements: 온보딩2 약관 동의 이력 (활성 버전 기준)
 */
export type RegisterAdopterV2Command = {
    tempId: string;
    email: string;
    nickname: string;
    phone?: string;
    profileImage?: string;
    realName: string;
    interestedBreedIds?: string[];
    counselDefaultProfile?: CounselDefaultProfileInput;
    termsAgreements: TermsAgreementInput[];
    marketingAgreed?: boolean;
};

export type RegisterAdopterV2Result = RegisterAdopterAuthSignupResult;
