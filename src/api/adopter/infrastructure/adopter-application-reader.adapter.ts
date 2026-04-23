import { Injectable } from '@nestjs/common';
import {
    type AdopterApplicationReaderPort,
    type AdopterApplicationRecord,
} from '../application/ports/adopter-application-reader.port';
import { AdopterApplicationRepository } from '../repository/adopter-application.repository';

@Injectable()
export class AdopterApplicationReaderAdapter implements AdopterApplicationReaderPort {
    constructor(private readonly adopterApplicationRepository: AdopterApplicationRepository) {}

    async findBreederIdsByAnimalType(animalType: 'cat' | 'dog'): Promise<string[]> {
        return this.adopterApplicationRepository.findBreederIdsByAnimalType(animalType);
    }

    countByAdopterId(adopterId: string, breederIds?: string[]): Promise<number> {
        return this.adopterApplicationRepository.countByAdopterId(adopterId, breederIds);
    }

    findPagedByAdopterId(
        adopterId: string,
        page: number,
        limit: number,
        breederIds?: string[],
    ): Promise<AdopterApplicationRecord[]> {
        return this.adopterApplicationRepository.findPagedByAdopterId(adopterId, page, limit, breederIds) as Promise<
            AdopterApplicationRecord[]
        >;
    }

    findByIdForAdopter(adopterId: string, applicationId: string): Promise<AdopterApplicationRecord | null> {
        return this.adopterApplicationRepository.findByIdForAdopter(
            adopterId,
            applicationId,
        ) as Promise<AdopterApplicationRecord | null>;
    }
}
