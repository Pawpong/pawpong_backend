/**
 * v2 입양 신청 폼 (Figma 122:3) — application 계층 내부 타입.
 *
 * v1 표준 폼(StandardApplicationData)의 필수 필드 5개와 v2 신규 adoptionPlan 1개로 구성된다.
 * v1 의 표준/커스텀 질문 시스템과 분리해 단순화된 진입점을 제공한다.
 */

export interface CreateAdoptionApplicationV2Command {
    adopterId: string;
    petId: string;
    adoptionPlan: string;
    familyMembers: string;
    privacyConsent: boolean;
    basicCareConsent: boolean;
    emergencyCareConsent: boolean;
    allFamilyConsent: boolean;
}

export interface CreateAdoptionApplicationV2Result {
    applicationId: string;
    status: 'consultation_pending';
}

export interface AdoptionApplicationContext {
    breederId: string;
    petName: string;
    adopterName?: string;
    adopterEmail?: string;
    adopterPhone?: string;
}

export interface AdoptionApplicationStandardResponses {
    privacyConsent: boolean;
    familyMembers: string;
    allFamilyConsent: boolean;
    canProvideBasicCare: boolean;
    canAffordMedicalExpenses: boolean;
    adoptionPlan: string;
}

export interface AdoptionApplicationPersistData {
    breederId: string;
    adopterId: string;
    adopterName?: string;
    adopterEmail?: string;
    adopterPhone?: string;
    petId: string;
    petName: string;
    status: 'consultation_pending';
    standardResponses: AdoptionApplicationStandardResponses;
}
