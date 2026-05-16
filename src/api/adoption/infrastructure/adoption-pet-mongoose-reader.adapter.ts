import { Injectable } from '@nestjs/common';

import type { AvailablePetDocument } from '../../../schema/available-pet.schema';
import {
    AdoptionPetDetailSnapshot,
    AdoptionPetListQuery,
    AdoptionPetReaderPort,
    AdoptionPetSnapshot,
    AdoptionPetType,
} from '../application/ports/adoption-pet-reader.port';
import { AdoptionPetRepository } from '../repository/adoption-pet.repository';

@Injectable()
export class AdoptionPetMongooseReaderAdapter implements AdoptionPetReaderPort {
    constructor(private readonly repository: AdoptionPetRepository) {}

    countList(query: Pick<AdoptionPetListQuery, 'petType' | 'breederId' | 'excludePetId'>): Promise<number> {
        return this.repository.countList(query);
    }

    async readList(query: AdoptionPetListQuery): Promise<AdoptionPetSnapshot[]> {
        const items = await this.repository.findList(query);
        return items.map((item) => this.toSnapshot(item as unknown as AvailablePetDocument));
    }

    async readPopular(petType: AdoptionPetType | undefined, limit: number): Promise<AdoptionPetSnapshot[]> {
        const items = await this.repository.findPopular(petType, limit);
        return items.map((item) => this.toSnapshot(item as unknown as AvailablePetDocument));
    }

    async readById(petId: string): Promise<AdoptionPetSnapshot | null> {
        const item = await this.repository.findById(petId);
        return item ? this.toSnapshot(item as unknown as AvailablePetDocument) : null;
    }

    async readByIdDetailed(petId: string): Promise<AdoptionPetDetailSnapshot | null> {
        const item = await this.repository.findActiveById(petId);
        return item ? this.toDetailSnapshot(item as unknown as AvailablePetDocument) : null;
    }

    incrementFavoriteCount(petId: string, delta: number): Promise<void> {
        return this.repository.incrementFavoriteCount(petId, delta);
    }

    private toSnapshot(pet: AvailablePetDocument): AdoptionPetSnapshot {
        return {
            id: pet._id.toString(),
            breederId: pet.breederId.toString(),
            name: pet.name,
            breed: pet.breed,
            petType: pet.petType,
            gender: pet.gender as 'male' | 'female',
            birthDate: pet.birthDate,
            price: pet.price,
            status: pet.status as 'available' | 'reserved' | 'adopted',
            photos: pet.photos ?? [],
            inquiryCount: pet.inquiryCount ?? 0,
            favoriteCount: pet.favoriteCount ?? 0,
            viewCount: pet.viewCount ?? 0,
            createdAt: pet.createdAt,
            updatedAt: pet.updatedAt,
        };
    }

    private toDetailSnapshot(pet: AvailablePetDocument): AdoptionPetDetailSnapshot {
        return {
            ...this.toSnapshot(pet),
            description: pet.description,
            // tags 는 별도 필드가 아직 schema 에 없음 — 미래 확장 대비 빈 배열 기본
            tags: [],
            representativePhotoIndex: pet.representativePhotoIndex,
            vaccinationStatus: pet.vaccinationStatus,
            vaccinationRecords: pet.vaccinationRecords ?? [],
            vaccinationIncompleteReason: pet.vaccinationIncompleteReason,
            geneticTestStatus: pet.geneticTestStatus,
            geneticTestRecords: pet.geneticTestRecords ?? [],
            geneticTestIncompleteReason: pet.geneticTestIncompleteReason,
            parentPetSnapshots: pet.parentPetSnapshots ?? [],
            breedingEnvironment: pet.breedingEnvironment,
        };
    }
}
