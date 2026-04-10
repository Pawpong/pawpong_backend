export const BREEDER_PUBLIC_READER_PORT = 'BREEDER_PUBLIC_READER_PORT';

export interface BreederPublicObjectIdLike {
    toString(): string;
}

export interface BreederPublicFavoriteRecord {
    favoriteBreederId: string;
}

export interface BreederPublicApplicationFormFieldRecord {
    id: string;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    order?: number;
}

export interface BreederPublicReviewPreviewRecord {
    reviewId?: string;
    writtenAt?: Date;
    type?: string;
    adopterName?: string;
    rating?: number;
    content?: string;
    photos?: string[];
    isVisible?: boolean;
}

export interface BreederPublicParentPetEmbeddedRecord {
    _id: BreederPublicObjectIdLike;
    name: string;
    breed: string;
    gender: string;
    birthDate: Date;
    photos?: string[];
    photoFileName?: string;
}

export interface BreederPublicBreederRecord {
    _id: BreederPublicObjectIdLike;
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
    availablePets?: Array<unknown>;
    favoriteBreederList?: BreederPublicFavoriteRecord[];
    stats?: {
        totalFavorites?: number;
        totalReviews?: number;
        averageRating?: number;
        profileViews?: number;
        [key: string]: unknown;
    };
    applicationForm?: BreederPublicApplicationFormFieldRecord[];
    reviews?: BreederPublicReviewPreviewRecord[];
    createdAt?: Date;
    accountStatus?: string;
    [key: string]: unknown;
}

export interface BreederPublicPetRecord {
    _id: BreederPublicObjectIdLike;
    name: string;
    breed: string;
    gender: string;
    birthDate: Date;
    price: number;
    status: string;
    description?: string;
    photos?: string[];
    photoFileName?: string;
    vaccinations?: string[];
    healthRecords?: string[];
    microchipNumber?: string;
    availableFrom?: Date;
    specialNotes?: string;
    createdAt: Date;
    parentInfo?: {
        mother?: BreederPublicParentPetEmbeddedRecord | null;
        father?: BreederPublicParentPetEmbeddedRecord | null;
    };
    [key: string]: unknown;
}

export interface BreederPublicParentPetRecord {
    _id: BreederPublicObjectIdLike;
    name: string;
    breed: string;
    gender: string;
    birthDate: Date;
    photoFileName?: string;
    healthRecords?: string[];
    description?: string;
    photos?: string[];
    [key: string]: unknown;
}

export interface BreederPublicReviewRecord {
    _id: BreederPublicObjectIdLike;
    applicationId?: {
        _id?: BreederPublicObjectIdLike;
        petName?: string;
        toString(): string;
    };
    adopterId?:
        | {
              nickname?: string;
              toString(): string;
          }
    content: string;
    writtenAt: Date;
    type: string;
    replyContent?: string | null;
    replyWrittenAt?: Date | null;
    replyUpdatedAt?: Date | null;
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
    findActiveParentPetsByBreederId(breederId: string): Promise<BreederPublicParentPetRecord[]>;
    findVisibleBreederReviewsByBreederId(
        breederId: string,
        page: number,
        limit: number,
    ): Promise<{ reviews: BreederPublicReviewRecord[]; total: number }>;
}
