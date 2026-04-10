import type { AdopterApplicationAnswerValue } from '../../types/adopter-application.type';

export type AdopterApplicationCustomAnswerCommand = {
    questionId: string;
    answer: AdopterApplicationAnswerValue;
};

export type AdopterApplicationCreateCommand = {
    name: string;
    phone: string;
    email: string;
    breederId: string;
    petId?: string;
    privacyConsent: boolean;
    selfIntroduction: string;
    familyMembers: string;
    allFamilyConsent: boolean;
    allergyTestInfo: string;
    timeAwayFromHome: string;
    livingSpaceDescription: string;
    previousPetExperience: string;
    canProvideBasicCare: boolean;
    canAffordMedicalExpenses: boolean;
    preferredPetDescription?: string;
    desiredAdoptionTiming?: string;
    additionalNotes?: string;
    customResponses?: AdopterApplicationCustomAnswerCommand[];
};
