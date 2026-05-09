import { Injectable } from '@nestjs/common';

import type { AvailablePetDocument } from '../../../schema/available-pet.schema';
import type {
    BreederPetPostingCardSnapshot,
    BreederPetPostingReaderPort,
    ListMyPostingsQuery,
    ListMyPostingsResult,
} from '../application/ports/breeder-pet-posting-reader.port';
import { BreederPetPostingRepository } from '../repository/breeder-pet-posting.repository';

@Injectable()
export class BreederPetPostingReaderMongooseAdapter implements BreederPetPostingReaderPort {
    constructor(private readonly repository: BreederPetPostingRepository) {}

    async listMyPostings(query: ListMyPostingsQuery): Promise<ListMyPostingsResult> {
        const { docs, totalItems } = await this.repository.listMyPostings({
            breederId: query.breederId,
            status: query.status,
            skip: query.skip,
            limit: query.limit,
        });
        return { snapshots: docs.map((doc) => this.toSnapshot(doc)), totalItems };
    }

    private toSnapshot(doc: AvailablePetDocument): BreederPetPostingCardSnapshot {
        return {
            petId: String(doc._id),
            name: doc.name,
            breed: doc.breed,
            gender: doc.gender as 'male' | 'female',
            birthDate: doc.birthDate,
            price: doc.price,
            status: doc.status as 'available' | 'reserved' | 'adopted',
            photos: doc.photos ?? [],
            representativePhotoIndex: doc.representativePhotoIndex ?? 0,
            description: doc.description ?? '',
            inquiryCount: doc.inquiryCount ?? 0,
            favoriteCount: doc.favoriteCount ?? 0,
            viewCount: doc.viewCount ?? 0,
            createdAt: doc.createdAt,
        };
    }
}
