export type AdoptionPetType = 'dog' | 'cat' | 'reptile';
export type AdoptionPetStatus = 'available' | 'reserved' | 'adopted';
export type AdoptionPetSort = 'latest' | 'popular';

export type AdoptionPetListQuery = {
    petType?: AdoptionPetType;
    sort: AdoptionPetSort;
    skip: number;
    limit: number;
};

export type AdoptionPetSnapshot = {
    id: string;
    breederId: string;
    breederName?: string;
    name: string;
    breed: string;
    petType?: AdoptionPetType;
    gender: 'male' | 'female';
    birthDate: Date;
    price: number;
    status: AdoptionPetStatus;
    photos: string[];
    inquiryCount: number;
    favoriteCount: number;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
};

export const ADOPTION_PET_READER_PORT = Symbol('ADOPTION_PET_READER_PORT');

export interface AdoptionPetReaderPort {
    countList(query: Pick<AdoptionPetListQuery, 'petType'>): Promise<number>;
    readList(query: AdoptionPetListQuery): Promise<AdoptionPetSnapshot[]>;
    readPopular(petType: AdoptionPetType | undefined, limit: number): Promise<AdoptionPetSnapshot[]>;
    readById(petId: string): Promise<AdoptionPetSnapshot | null>;
    incrementFavoriteCount(petId: string, delta: number): Promise<void>;
}
