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

/**
 * v2 입양 상세 응답 (Figma 39:1240).
 * 카드 응답 + 건강/부모/사육환경/태그/소개/브리더 요약을 포함.
 */
export type AdoptedPetCardResult = AdoptionPetItemResult & {
    adoptedAt: string;
};

export type AdoptionPetDetailResult = AdoptionPetItemResult & {
    description?: string;
    tags: string[];
    birthDate: string;
    vaccinationStatus?: 'completed' | 'incomplete';
    vaccinationRecords: Array<{ name: string; date: string; round: number }>;
    vaccinationIncompleteReason?: string;
    geneticTestStatus?: 'completed' | 'incomplete';
    geneticTestRecords: Array<{ date: string; institution: string; testName: string; result: string }>;
    geneticTestIncompleteReason?: string;
    parents: Array<{
        relation: 'mother' | 'father';
        breed: string;
        name: string;
        birthDate?: string;
        photoUrl?: string;
    }>;
    breedingEnvironment?: {
        description?: string;
        photoUrl?: string;
    };
    breeder: {
        breederId: string;
        displayName: string;
        profileImageUrl?: string;
        locationText?: string;
        bpm: number;
    };
};
