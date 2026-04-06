export interface BreedAdminSnapshot {
    id: string;
    petType: string;
    category: string;
    categoryDescription?: string;
    breeds: string[];
    createdAt: Date;
    updatedAt: Date;
}

export const BREED_ADMIN_READER = Symbol('BREED_ADMIN_READER');

export interface BreedAdminReaderPort {
    readAll(): Promise<BreedAdminSnapshot[]>;
    findById(id: string): Promise<BreedAdminSnapshot | null>;
    findByPetTypeAndCategory(petType: string, category: string, excludeId?: string): Promise<BreedAdminSnapshot | null>;
}
