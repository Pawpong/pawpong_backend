export type AdopterApplicationCustomAnswerCommand = {
    questionId: string;
    answer: unknown;
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
