import type { AdopterApplicationAnswerValue } from '../../types/adopter-application.type';

export type AdopterApplicationCustomAnswerCommand = {
    questionId: string;
    answer: AdopterApplicationAnswerValue;
};

export type AdopterApplicationCreateCommand = {
    // 연락처(name/phone/email)는 미입력 시 use-case 에서 로그인 프로필로 보강한다.
    name?: string;
    phone?: string;
    email?: string;
    breederId: string;
    petId?: string;
    privacyConsent: boolean;
    selfIntroduction: string;
    familyMembers: string;
    allFamilyConsent: boolean;
    allergyTestInfo?: string;
    timeAwayFromHome?: string;
    livingSpaceDescription?: string;
    previousPetExperience?: string;
    canProvideBasicCare: boolean;
    canAffordMedicalExpenses: boolean;
    preferredPetDescription?: string;
    desiredAdoptionTiming?: string;
    additionalNotes?: string;
    customResponses?: AdopterApplicationCustomAnswerCommand[];
};
