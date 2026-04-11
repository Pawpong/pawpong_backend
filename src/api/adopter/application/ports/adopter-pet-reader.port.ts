export type AdopterPetRecord = {
    _id: { toString(): string };
    name: string;
    status?: string;
};

export const ADOPTER_PET_READER_PORT = Symbol('ADOPTER_PET_READER_PORT');

export interface AdopterPetReaderPort {
    findByIdAndBreeder(petId: string, breederId: string): Promise<AdopterPetRecord | null>;
}
