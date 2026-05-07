import type { AdoptionPetStatus, AdoptionPetType } from '../ports/adoption-pet-reader.port';
import type { PageResult } from '../../../../common/types/page-result.type';

export type AdoptionPetItemResult = {
    petId: string;
    breederId: string;
    breederName?: string;
    name: string;
    breed: string;
    petType?: AdoptionPetType;
    gender: 'male' | 'female';
    ageDescription: string;
    price: number;
    status: AdoptionPetStatus;
    primaryPhotoUrl: string;
    photoUrls: string[];
    inquiryCount: number;
    favoriteCount: number;
    viewCount: number;
    isFavorited: boolean;
    isPopular: boolean;
    createdAt: string;
};

export type AdoptionPetListResult = PageResult<AdoptionPetItemResult>;
