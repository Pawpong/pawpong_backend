export const BREED_READER = Symbol('BREED_READER');

export type BreedCategorySnapshot = {
    readonly category: string;
    readonly categoryDescription?: string;
    readonly breeds: string[];
};

export interface BreedReaderPort {
    readByPetType(petType: string): Promise<BreedCategorySnapshot[]>;
}
