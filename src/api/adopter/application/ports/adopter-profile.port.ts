import type {
    AdopterFavoriteRecord,
    AdopterProfileApplicationRecord,
    AdopterProfileUpdateRecord,
    AdopterWrittenReviewEmbeddedRecord,
} from '../../types/adopter-profile.type';
import type { AdopterObjectIdLike } from '../../types/adopter-application.type';
import type { AdopterBreederRecord } from '../../types/adopter-breeder.type';

export const ADOPTER_PROFILE_PORT = Symbol('ADOPTER_PROFILE_PORT');

export type FavoriteBreederRecord = AdopterFavoriteRecord;

export interface AdopterProfileRecord {
    _id: AdopterObjectIdLike;
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
    adoptionApplicationList?: AdopterProfileApplicationRecord[];
    writtenReviewList?: AdopterWrittenReviewEmbeddedRecord[];
    createdAt: Date;
    updatedAt: Date;
}

export interface AdopterProfilePort {
    findById(adopterId: string): Promise<AdopterProfileRecord | null>;
    findById(adopterId: string, userRole: string): Promise<AdopterProfileRecord | AdopterBreederRecord | null>;
    findById(adopterId: string, userRole?: string): Promise<AdopterProfileRecord | AdopterBreederRecord | null>;
    updateProfile(
        adopterId: string,
        updateData: AdopterProfileUpdateRecord,
    ): Promise<AdopterProfileRecord | null>;
    updateProfile(
        adopterId: string,
        updateData: AdopterProfileUpdateRecord,
        userRole: string,
    ): Promise<AdopterProfileRecord | AdopterBreederRecord | null>;
    updateProfile(
        adopterId: string,
        updateData: AdopterProfileUpdateRecord,
        userRole?: string,
    ): Promise<AdopterProfileRecord | AdopterBreederRecord | null>;
    findFavoriteList(
        adopterId: string,
        page: number,
        limit: number,
        userRole?: string,
    ): Promise<{ favorites: FavoriteBreederRecord[]; total: number }>;
    addFavoriteBreeder(adopterId: string, favoriteData: FavoriteBreederRecord, userRole?: string): Promise<void>;
    removeFavoriteBreeder(adopterId: string, breederId: string, userRole?: string): Promise<void>;
}
