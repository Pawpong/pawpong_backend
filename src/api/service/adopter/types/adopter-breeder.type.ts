import type { AdopterFavoriteRecord } from './adopter-profile.type';
import type { AdopterApplicationCustomQuestionRecord, AdopterObjectIdLike } from './adopter-application.type';

export type AdopterBreederAvailablePetRecord = {
    status?: string;
    isActive?: boolean;
};

export type AdopterBreederRecord = {
    _id: AdopterObjectIdLike;
    name: string;
    nickname?: string;
    emailAddress?: string;
    phoneNumber?: string;
    accountStatus?: string;
    profileImageFileName?: string | null;
    favoriteBreederList?: AdopterFavoriteRecord[];
    petType?: string;
    breeds?: string[];
    stats?: {
        averageRating?: number;
        totalReviews?: number;
    };
    availablePets?: AdopterBreederAvailablePetRecord[];
    applicationForm?: AdopterApplicationCustomQuestionRecord[];
    profile?: {
        location?: {
            city?: string;
            district?: string;
        };
        representativePhotos?: string[];
        specialization?: string[];
        priceRange?: {
            min: number;
            max: number;
            display?: string;
        };
    };
};
