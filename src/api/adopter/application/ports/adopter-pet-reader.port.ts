export type AdopterPetRecord = {
    _id: { toString(): string };
    name: string;
    status?: string;
};

export abstract class AdopterPetReaderPort {
    abstract findByIdAndBreeder(petId: string, breederId: string): Promise<AdopterPetRecord | null>;
}
