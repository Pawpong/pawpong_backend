export const BREEDER_MANAGEMENT_LIST_READER_PORT = 'BREEDER_MANAGEMENT_LIST_READER_PORT';

export interface BreederManagementBreederSummary {
    averageRating?: number;
}

export interface BreederManagementReceivedApplicationRecord {
    _id: unknown;
    adopterId?: unknown;
    adopterName?: string;
    standardResponses?: {
        preferredPetDescription?: string | null;
    };
    [key: string]: unknown;
}

export interface BreederManagementPetRecord {
    _id?: unknown;
    petId?: string;
    name: string;
    breed: string;
    gender: string;
    birthDate: Date;
    price?: number;
    status?: string;
    isActive?: boolean;
    photos?: string[];
    viewCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: unknown;
}

export interface BreederManagementReviewRecord {
    _id: unknown;
    adopterId?: {
        _id?: unknown;
        name?: string;
        nickname?: string;
    };
    content: string;
    writtenAt: Date;
    type?: string;
    isVisible?: boolean;
    isReported?: boolean;
    replyContent?: string | null;
    replyWrittenAt?: Date | null;
    replyUpdatedAt?: Date | null;
    [key: string]: unknown;
}

export interface BreederManagementListReaderPort {
    findBreederSummary(userId: string): Promise<BreederManagementBreederSummary | null>;
    findReceivedApplications(
        userId: string,
        page: number,
        limit: number,
    ): Promise<{ applications: BreederManagementReceivedApplicationRecord[]; total: number }>;
    findMyPetsSnapshot(
        userId: string,
        options: {
            status?: string;
            includeInactive: boolean;
            page: number;
            limit: number;
        },
    ): Promise<{
        pets: BreederManagementPetRecord[];
        total: number;
        availableCount: number;
        reservedCount: number;
        adoptedCount: number;
        inactiveCount: number;
        applicationCountMap: Map<string, number>;
    }>;
    findMyReviewsSnapshot(
        userId: string,
        visibility: string,
        page: number,
        limit: number,
    ): Promise<{
        reviews: BreederManagementReviewRecord[];
        filteredTotal: number;
        totalCount: number;
        visibleCount: number;
        hiddenCount: number;
    }>;
}
