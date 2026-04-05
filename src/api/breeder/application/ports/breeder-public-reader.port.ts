export const BREEDER_PUBLIC_READER_PORT = 'BREEDER_PUBLIC_READER_PORT';

export interface BreederPublicBreederRecord {
    _id: unknown;
    name: string;
    emailAddress: string;
    socialAuthInfo?: {
        authProvider?: string;
    };
    verification?: {
        status?: string;
        level?: string;
    };
    profile?: {
        location?: {
            city?: string;
            district?: string;
        };
        specialization?: string[];
        representativePhotos?: string[];
        priceRange?: {
            min?: number;
            max?: number;
            display?: string;
        };
        description?: string;
    };
    profileImageFileName?: string | null;
    petType?: string;
    detailBreed?: string;
    breeds?: string[];
    stats?: {
        totalFavorites?: number;
        totalReviews?: number;
        averageRating?: number;
        profileViews?: number;
        [key: string]: unknown;
    };
    applicationForm?: Array<{
        id?: string;
        type?: string;
        label?: string;
        required?: boolean;
        options?: string[];
        placeholder?: string;
    }>;
    reviews?: Array<{
        reviewId?: string;
        writtenAt?: Date;
        type?: string;
        adopterName?: string;
        rating?: number;
        content?: string;
        photos?: string[];
        isVisible?: boolean;
    }>;
    createdAt?: Date;
    accountStatus?: string;
    [key: string]: unknown;
}

export interface BreederPublicPetRecord {
    _id: unknown;
    name: string;
    breed: string;
    gender: string;
    birthDate?: Date;
    price?: number;
    status?: string;
    description?: string;
    photos?: string[];
    photoFileName?: string;
    parentInfo?: {
        mother?: any;
        father?: any;
    };
    [key: string]: unknown;
}

export interface BreederPublicReaderPort {
    searchPublicBreeders(
        filter: Record<string, unknown>,
        sortOrder: Record<string, 1 | -1>,
        page: number,
        limit: number,
    ): Promise<{ breeders: BreederPublicBreederRecord[]; total: number }>;
    findPopularPublicBreeders(limit: number): Promise<BreederPublicBreederRecord[]>;
    findPublicBreederById(breederId: string): Promise<BreederPublicBreederRecord | null>;
    findAdopterFavoriteBreederIds(userId: string): Promise<string[] | null>;
    findBreederFavoriteBreederIds(userId: string): Promise<string[] | null>;
    findBreederIdsWithAvailablePets(): Promise<string[]>;
    incrementProfileViews(breederId: string): Promise<void>;
    findActiveAvailablePetsByBreederId(breederId: string): Promise<BreederPublicPetRecord[]>;
    findActiveParentPetsByBreederId(breederId: string): Promise<BreederPublicPetRecord[]>;
    findVisibleBreederReviewsByBreederId(
        breederId: string,
        page: number,
        limit: number,
    ): Promise<{ reviews: any[]; total: number }>;
}
