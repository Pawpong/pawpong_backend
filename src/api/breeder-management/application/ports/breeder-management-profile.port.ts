import type { BreederManagementProfileUpdateCommand } from '../types/breeder-management-profile-command.type';

export const BREEDER_MANAGEMENT_PROFILE_PORT = Symbol('BREEDER_MANAGEMENT_PROFILE_PORT');

export interface BreederManagementVerificationDocumentRecord {
    type: string;
    fileName: string;
    originalFileName?: string;
    uploadedAt?: Date;
}

export interface BreederManagementBreederStatsRecord {
    totalApplications?: number;
    completedAdoptions?: number;
    averageRating?: number;
    totalReviews?: number;
    profileViews?: number;
}

export interface BreederManagementApplicationFormRecord {
    id: string;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    order: number;
}

export interface BreederManagementBreederRecord {
    _id: unknown;
    name: string;
    nickname?: string;
    emailAddress: string;
    phoneNumber?: string;
    socialAuthInfo?: {
        authProvider?: string;
    };
    marketingAgreed?: boolean;
    accountStatus?: string;
    petType?: string;
    profileImageFileName?: string | null;
    verification?: {
        status?: string;
        plan?: string;
        level?: string;
        submittedAt?: Date;
        reviewedAt?: Date;
        rejectionReason?: string;
        documents?: BreederManagementVerificationDocumentRecord[];
        submittedByEmail?: boolean;
        [key: string]: unknown;
    };
    profile?: {
        description?: string;
        location?: {
            city?: string;
            district?: string;
            address?: string;
        };
        representativePhotos?: string[];
        priceRange?: {
            min?: number;
            max?: number;
            display?: string;
        };
        specialization?: string[];
        experienceYears?: number;
        [key: string]: unknown;
    } | null;
    breeds?: string[];
    applicationForm?: BreederManagementApplicationFormRecord[];
    stats?: BreederManagementBreederStatsRecord;
    consultationAgreed?: boolean;
    [key: string]: unknown;
}

export interface BreederManagementParentPetRecord {
    _id?: unknown;
    petId?: string;
    name?: string;
    breed?: string;
    gender?: string;
    birthDate?: Date;
    photoFileName?: string | null;
    photos?: string[];
    healthRecords?: string[];
    description?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    toObject?: () => Omit<BreederManagementParentPetRecord, 'toObject'>;
    [key: string]: unknown;
}

export interface BreederManagementAvailablePetRecord {
    _id?: unknown;
    petId?: string;
    name?: string;
    breed?: string;
    gender?: string;
    birthDate?: Date;
    price?: number;
    status?: string;
    photos?: string[];
    description?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    parentInfo?: {
        mother?: unknown;
        father?: unknown;
    };
    [key: string]: unknown;
}

export interface BreederManagementRecentApplicationRecord {
    _id?: unknown;
    adopterName?: string;
    petName?: string;
    status?: string;
    appliedAt?: Date;
}

export interface BreederManagementProfilePort {
    findById(breederId: string): Promise<BreederManagementBreederRecord | null>;
    findByIdWithAllData(breederId: string): Promise<BreederManagementBreederRecord | null>;
    updateProfile(
        breederId: string,
        updateData: Record<string, unknown>,
    ): Promise<BreederManagementBreederRecord | null>;
    findActiveParentPetsByBreederId(breederId: string): Promise<BreederManagementParentPetRecord[]>;
    findActiveAvailablePetsByBreederId(breederId: string): Promise<BreederManagementAvailablePetRecord[]>;
    countPendingApplications(breederId: string): Promise<number>;
    findRecentApplications(breederId: string, limit: number): Promise<BreederManagementRecentApplicationRecord[]>;
    countActiveAvailablePets(breederId: string): Promise<number>;
}

export interface BreederManagementProfileUpdateMapper {
    toUpdateData(
        breeder: BreederManagementBreederRecord,
        updateData: BreederManagementProfileUpdateCommand,
    ): Record<string, unknown>;
}
