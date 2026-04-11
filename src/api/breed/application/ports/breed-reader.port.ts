export const BREED_READER_PORT = Symbol('BREED_READER_PORT');

export type BreedCategorySnapshot = {
    readonly category: string;
    readonly categoryDescription?: string;
    readonly breeds: string[];
};

export interface BreedReaderPort {
    readByPetType(petType: string): Promise<BreedCategorySnapshot[]>;
}
