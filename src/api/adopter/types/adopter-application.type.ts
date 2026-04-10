export type AdopterObjectIdLike = {
    toString(): string;
};

export type AdopterApplicationAnswerValue = string | string[];

export type AdopterApplicationStandardResponsesRecord = {
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
};

export type AdopterApplicationCustomQuestionRecord = {
    id: string;
    label: string;
    type: string;
};

export type AdopterApplicationCustomResponseRecord = {
    questionId: string;
    questionLabel: string;
    questionType: string;
    answer: AdopterApplicationAnswerValue;
};

export type AdopterApplicationEmbeddedRecord = {
    applicationId: string;
    targetBreederId: string;
    targetPetId: string;
    applicationStatus: string;
    appliedAt: Date;
};
