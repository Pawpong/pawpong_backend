export const BREEDER_PET_POSTING_READER_PORT = Symbol('BREEDER_PET_POSTING_READER_PORT');

export type BreederPetPostingStatus = 'available' | 'reserved' | 'adopted';

export interface BreederPetPostingCardSnapshot {
    petId: string;
    name: string;
    breed: string;
    gender: 'male' | 'female';
    birthDate: Date;
    price: number;
    status: BreederPetPostingStatus;
    photos: string[];
    representativePhotoIndex: number;
    description: string;
    inquiryCount: number;
    favoriteCount: number;
    viewCount: number;
    createdAt: Date;
}

export interface ListMyPostingsQuery {
    breederId: string;
    status?: BreederPetPostingStatus;
    skip: number;
    limit: number;
}

export interface ListMyPostingsResult {
    snapshots: BreederPetPostingCardSnapshot[];
    totalItems: number;
}

export interface BreederPetPostingReaderPort {
    listMyPostings(query: ListMyPostingsQuery): Promise<ListMyPostingsResult>;
}
