import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AdopterPetFavorite } from '../../../schema/adopter-pet-favorite.schema';
import type { AvailablePetDocument } from '../../../schema/available-pet.schema';
import type { AdoptionPetStatus } from '../application/ports/adoption-pet-reader.port';

/**
 * 즐겨찾기 read-only 조회 헬퍼.
 * 트랜잭션이 필요한 add/remove 는 어댑터(AdopterPetFavoriteMongooseAdapter)가 직접 수행한다.
 */
@Injectable()
export class AdopterPetFavoriteRepository {
    constructor(@InjectModel(AdopterPetFavorite.name) private readonly model: Model<AdopterPetFavorite>) {}

    async exists(adopterId: string, petId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(adopterId) || !Types.ObjectId.isValid(petId)) {
            return false;
        }
        const found = await this.model.exists({
            adopterId: new Types.ObjectId(adopterId),
            petId: new Types.ObjectId(petId),
        });
        return Boolean(found);
    }

    async findFavoritedPetIds(adopterId: string, petIds: string[]): Promise<Set<string>> {
        if (!Types.ObjectId.isValid(adopterId) || petIds.length === 0) {
            return new Set();
        }
        const validPetIds = petIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        if (validPetIds.length === 0) {
            return new Set();
        }
        const docs = await this.model
            .find({ adopterId: new Types.ObjectId(adopterId), petId: { $in: validPetIds } }, { petId: 1 })
            .lean()
            .exec();
        return new Set(docs.map((doc) => doc.petId.toString()));
    }

    /**
     * 입양자의 즐겨찾기 펫을 즐겨찾기 추가 시각 desc 로 정렬, status 필터 + 페이지네이션해서 반환.
     * available_pets 컬렉션과 $lookup 으로 join 해 비활성 펫은 제외하고 한 번의 쿼리로 카드 데이터를 모은다.
     */
    async aggregateFavoritedPets(
        adopterId: string,
        query: { statusFilter?: AdoptionPetStatus; skip: number; limit: number },
    ): Promise<{ pets: AvailablePetDocument[]; totalItems: number }> {
        if (!Types.ObjectId.isValid(adopterId)) {
            return { pets: [], totalItems: 0 };
        }

        const petMatch: Record<string, unknown> = { 'pet.isActive': true };
        if (query.statusFilter) {
            petMatch['pet.status'] = query.statusFilter;
        }

        const result = await this.model
            .aggregate<{
                items: AvailablePetDocument[];
                total: Array<{ count: number }>;
            }>([
                { $match: { adopterId: new Types.ObjectId(adopterId) } },
                {
                    $lookup: {
                        from: 'available_pets',
                        localField: 'petId',
                        foreignField: '_id',
                        as: 'pet',
                    },
                },
                { $unwind: '$pet' },
                { $match: petMatch },
                { $sort: { createdAt: -1 } },
                {
                    $facet: {
                        items: [{ $skip: query.skip }, { $limit: query.limit }, { $replaceRoot: { newRoot: '$pet' } }],
                        total: [{ $count: 'count' }],
                    },
                },
            ])
            .exec();

        const facet = result[0];
        const totalItems = facet?.total?.[0]?.count ?? 0;
        const pets = (facet?.items ?? []) as AvailablePetDocument[];
        return { pets, totalItems };
    }
}
