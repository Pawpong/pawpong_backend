import type {
    AdopterApplicationCustomResponseRecord,
    AdopterApplicationStandardResponsesRecord,
    AdopterObjectIdLike,
} from '../../types/adopter-application.type';

export const ADOPTER_APPLICATION_READER_PORT = Symbol('ADOPTER_APPLICATION_READER_PORT');

export interface AdopterApplicationRecord {
    _id: AdopterObjectIdLike;
    breederId: AdopterObjectIdLike;
    adopterId?: { _id?: AdopterObjectIdLike; toString(): string } | string;
    petId?: AdopterObjectIdLike;
    petName?: string;
    status: string;
    appliedAt: Date;
    processedAt?: Date;
    standardResponses?: AdopterApplicationStandardResponsesRecord;
    customResponses?: AdopterApplicationCustomResponseRecord[];
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
