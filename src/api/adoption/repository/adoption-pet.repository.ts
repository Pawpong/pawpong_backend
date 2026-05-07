import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { AvailablePet } from '../../../schema/available-pet.schema';
import type { AdoptionPetListQuery, AdoptionPetType } from '../application/ports/adoption-pet-reader.port';

@Injectable()
export class AdoptionPetRepository {
    constructor(@InjectModel(AvailablePet.name) private readonly model: Model<AvailablePet>) {}

    private buildBaseFilter(petType?: AdoptionPetType): FilterQuery<AvailablePet> {
        const filter: FilterQuery<AvailablePet> = { isActive: true };
        if (petType) {
            filter.petType = petType;
        }
        return filter;
    }

    countList(query: Pick<AdoptionPetListQuery, 'petType'>): Promise<number> {
        return this.model.countDocuments(this.buildBaseFilter(query.petType)).exec();
    }

    findList(query: AdoptionPetListQuery): Promise<AvailablePet[]> {
        const filter = this.buildBaseFilter(query.petType);
        const sort: Record<string, 1 | -1> =
            query.sort === 'popular' ? { favoriteCount: -1, createdAt: -1 } : { createdAt: -1 };
        return this.model.find(filter).sort(sort).skip(query.skip).limit(query.limit).exec();
    }

    findPopular(petType: AdoptionPetType | undefined, limit: number): Promise<AvailablePet[]> {
        const filter = this.buildBaseFilter(petType);
        // 인기 동물은 입양 가능 상태만 노출
        filter.status = 'available';
        return this.model
            .find(filter)
            .sort({ favoriteCount: -1, viewCount: -1, createdAt: -1 })
            .limit(limit)
            .exec();
    }

    findById(petId: string): Promise<AvailablePet | null> {
        if (!Types.ObjectId.isValid(petId)) {
            return Promise.resolve(null);
        }
        return this.model.findById(petId).exec();
    }

    async incrementFavoriteCount(petId: string, delta: number): Promise<void> {
        if (!Types.ObjectId.isValid(petId)) {
            return;
        }
        await this.model.updateOne({ _id: new Types.ObjectId(petId) }, { $inc: { favoriteCount: delta } }).exec();
    }
}
