export type AuthObjectIdLike = {
    toString(): string;
};

export type AuthSocialAuthInfoRecord = {
    authProvider?: string;
    providerUserId?: string;
    providerEmail?: string;
};

export type AuthVerificationRecord = {
    plan?: string;
    level?: string;
    status?: string;
    submittedAt?: Date;
};

export type AuthProfileLocationRecord = {
    city?: string;
    district?: string;
};

export type AuthProfileRecord = {
    location?: AuthProfileLocationRecord;
    representativePhotos?: string[];
} | null;

export type AuthRegistrationRecord = {
    _id: AuthObjectIdLike;
    emailAddress: string;
    nickname?: string;
    name?: string;
    phoneNumber?: string;
    profileImageFileName?: string | null;
    accountStatus: string;
    refreshToken?: string | null;
    socialAuthInfo?: AuthSocialAuthInfoRecord;
    createdAt?: Date;
    petType?: string;
    breeds?: string[];
    verification?: AuthVerificationRecord;
    profile?: AuthProfileRecord;
};

export type AuthSocialLoginUserRecord = {
    userId: string;
    email: string;
    name: string;
    role: string;
};

export type AuthVerificationUploadMap = {
    idCard: string;
    animalProductionLicense: string;
    adoptionContractSample?: string;
    recentAssociationDocument?: string;
    breederCertification?: string;
    ticaCfaDocument?: string;
};

export type AuthParsedSocialAuthInfo = {
    authProvider: string;
    providerUserId: string;
    providerEmail: string;
};
