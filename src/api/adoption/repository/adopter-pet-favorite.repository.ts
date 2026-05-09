import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AdopterPetFavorite } from '../../../schema/adopter-pet-favorite.schema';

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
}
