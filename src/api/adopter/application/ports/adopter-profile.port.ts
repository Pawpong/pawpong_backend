export const ADOPTER_PROFILE_PORT = Symbol('ADOPTER_PROFILE_PORT');

export interface FavoriteBreederRecord {
    favoriteBreederId: string;
    breederName: string;
    breederProfileImageUrl?: string;
    breederLocation?: string;
    addedAt: Date;
}

export interface AdopterProfileRecord {
    _id: { toString(): string };
    emailAddress: string;
    nickname: string;
    phoneNumber?: string;
    profileImageFileName?: string;
    accountStatus: string;
    socialAuthInfo?: {
        authProvider?: string;
    };
    marketingAgreed?: boolean;
    marketingConsent?: boolean;
    favoriteBreederList?: FavoriteBreederRecord[];
    adoptionApplicationList?: any[];
    writtenReviewList?: any[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AdopterProfilePort {
    findById(adopterId: string): Promise<AdopterProfileRecord | null>;
    updateProfile(adopterId: string, updateData: any): Promise<AdopterProfileRecord | null>;
    findFavoriteList(
        adopterId: string,
        page: number,
        limit: number,
    ): Promise<{ favorites: FavoriteBreederRecord[]; total: number }>;
    addFavoriteBreeder(adopterId: string, favoriteData: any): Promise<void>;
    removeFavoriteBreeder(adopterId: string, breederId: string): Promise<void>;
}
