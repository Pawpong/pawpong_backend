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
    // Breeder 는 User 를 상속하고 스키마가 timestamps: true 라 아래 값들이 실제 문서에 존재한다.
    // 신청자 프로필 응답을 브리더로도 채우기 위해 필요한 만큼만 선언한다.
    socialAuthInfo?: {
        authProvider?: string;
    };
    marketingAgreed?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
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
