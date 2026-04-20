export type RegisterAdopterAuthSignupCommand = {
    tempId: string;
    email: string;
    nickname: string;
    phone?: string;
    profileImage?: string;
    marketingAgreed?: boolean;
};

export type RegisterBreederAuthSignupCommand = {
    email: string;
    phoneNumber: string;
    breederName: string;
    breederLocation: {
        city: string;
        district?: string;
    };
    animal: string;
    breeds: string[];
    plan: string;
    level: string;
    agreements: {
        termsOfService: boolean;
        privacyPolicy: boolean;
        marketingConsent?: boolean;
    };
    tempId?: string;
    provider?: string;
    profileImage?: string;
    documentUrls?: string[];
    documentTypes?: string[];
};

export type RegisterAdopterAuthSignupResult = {
    adopterId: string;
    email: string;
    nickname: string;
    phoneNumber: string;
    profileImage: string;
    userRole: string;
    accountStatus: string;
    createdAt: string;
    accessToken: string;
    refreshToken: string;
};

export type RegisterBreederAuthSignupResult = {
    breederId: string;
    email: string;
    breederName: string;
    breederLocation: string;
    animal: string;
    breeds: string[];
    plan: string;
    level: string;
    verificationStatus: string;
    createdAt: string;
    accessToken: string;
    refreshToken: string;
};

export type CompleteSocialRegistrationCommand = {
    tempId: string;
    provider?: string;
    email: string;
    name: string;
    role: 'adopter' | 'breeder';
    phone?: string;
    marketingAgreed?: boolean;
    nickname?: string;
    petType?: string;
    plan?: string;
    breederName?: string;
    introduction?: string;
    city?: string;
    district?: string;
    breeds?: string[];
    level?: string;
};
