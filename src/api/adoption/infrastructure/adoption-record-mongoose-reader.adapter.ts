import { Injectable } from '@nestjs/common';

import type { AvailablePetDocument } from '../../../schema/available-pet.schema';
import type { AdoptionPetSnapshot } from '../application/ports/adoption-pet-reader.port';
import type {
    AdoptionRecordReaderPort,
    ListMyAdoptedQuery,
    ListMyAdoptedResult,
} from '../application/ports/adoption-record-reader.port';
import { AdoptionRecordRepository } from '../repository/adoption-record.repository';

@Injectable()
export class AdoptionRecordMongooseReaderAdapter implements AdoptionRecordReaderPort {
    constructor(private readonly repository: AdoptionRecordRepository) {}

    async listMyAdopted(query: ListMyAdoptedQuery): Promise<ListMyAdoptedResult> {
        const { docs, totalItems } = await this.repository.aggregateMyAdopted(query.adopterId, {
            skip: query.skip,
            limit: query.limit,
        });

        return {
            items: docs.map((doc) => ({
                pet: this.toPetSnapshot(doc.pet),
                adoptedAt: doc.adoptedAt instanceof Date ? doc.adoptedAt : new Date(doc.adoptedAt),
            })),
            totalItems,
        };
    }

    private toPetSnapshot(pet: AvailablePetDocument): AdoptionPetSnapshot {
        return {
            id: String(pet._id),
            breederId: String(pet.breederId),
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
}
