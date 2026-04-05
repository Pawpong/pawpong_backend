export const ADOPTER_APPLICATION_READER_PORT = Symbol('ADOPTER_APPLICATION_READER_PORT');

export interface AdopterApplicationRecord {
    _id: { toString(): string };
    breederId: { toString(): string };
    adopterId?: { _id?: { toString(): string }; toString(): string } | string;
    petId?: { toString(): string };
    petName?: string;
    status: string;
    appliedAt: Date;
    processedAt?: Date;
    standardResponses?: Record<string, any>;
    customResponses?: any[];
    breederNotes?: string;
}

export interface AdopterApplicationReaderPort {
    findBreederIdsByAnimalType(animalType: 'cat' | 'dog'): Promise<string[]>;
    countByAdopterId(adopterId: string, breederIds?: string[]): Promise<number>;
    findPagedByAdopterId(
        adopterId: string,
        page: number,
        limit: number,
        breederIds?: string[],
    ): Promise<AdopterApplicationRecord[]>;
    findByIdForAdopter(adopterId: string, applicationId: string): Promise<AdopterApplicationRecord | null>;
}
