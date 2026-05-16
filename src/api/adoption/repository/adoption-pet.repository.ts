import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { AvailablePet } from '../../../schema/available-pet.schema';
import type { AdoptionPetListQuery, AdoptionPetStatus, AdoptionPetType } from '../application/ports/adoption-pet-reader.port';

@Injectable()
export class AdoptionPetRepository {
    constructor(@InjectModel(AvailablePet.name) private readonly model: Model<AvailablePet>) {}

    private buildBaseFilter(input: {
        petType?: AdoptionPetType;
        breederId?: string;
        excludePetId?: string;
        status?: AdoptionPetStatus;
    }): FilterQuery<AvailablePet> {
        const filter: FilterQuery<AvailablePet> = { isActive: true };
        if (input.petType) {
            filter.petType = input.petType;
        }
        if (input.breederId && Types.ObjectId.isValid(input.breederId)) {
            filter.breederId = new Types.ObjectId(input.breederId);
        }
        if (input.excludePetId && Types.ObjectId.isValid(input.excludePetId)) {
            filter._id = { $ne: new Types.ObjectId(input.excludePetId) };
        }
        if (input.status) {
            filter.status = input.status;
        }
        return filter;
    }

    countList(query: Pick<AdoptionPetListQuery, 'petType' | 'breederId' | 'excludePetId' | 'status'>): Promise<number> {
        return this.model.countDocuments(this.buildBaseFilter(query)).exec();
    }

    findList(query: AdoptionPetListQuery): Promise<AvailablePet[]> {
        const filter = this.buildBaseFilter(query);
        const sort: Record<string, 1 | -1> =
            query.sort === 'popular' ? { favoriteCount: -1, createdAt: -1 } : { createdAt: -1 };
        return this.model.find(filter).sort(sort).skip(query.skip).limit(query.limit).exec();
    }

    findPopular(petType: AdoptionPetType | undefined, limit: number): Promise<AvailablePet[]> {
        const filter = this.buildBaseFilter({ petType });
        // 인기 동물은 입양 가능 상태만 노출
        filter.status = 'available';
        return this.model.find(filter).sort({ favoriteCount: -1, viewCount: -1, createdAt: -1 }).limit(limit).exec();
    }

    findById(petId: string): Promise<AvailablePet | null> {
        if (!Types.ObjectId.isValid(petId)) {
            return Promise.resolve(null);
        }
        return this.model.findById(petId).exec();
    }

    /**
     * isActive=false 항목은 조회 결과에서 제외한다 (입양 상세 진입 차단).
     */
    findActiveById(petId: string): Promise<AvailablePet | null> {
        if (!Types.ObjectId.isValid(petId)) {
            return Promise.resolve(null);
        }
        return this.model.findOne({ _id: new Types.ObjectId(petId), isActive: true }).exec();
    }

    async incrementFavoriteCount(petId: string, delta: number): Promise<void> {
        if (!Types.ObjectId.isValid(petId)) {
            return;
        }
        await this.model.updateOne({ _id: new Types.ObjectId(petId) }, { $inc: { favoriteCount: delta } }).exec();
    }

    /**
     * 상세 진입 viewCount 원자 증가. isActive=true 인 도큐먼트만 갱신하며, 갱신 후의 viewCount 를 반환한다.
     * 항목이 없거나 비활성이면 null 반환.
     */
    async incrementViewCount(petId: string): Promise<number | null> {
        if (!Types.ObjectId.isValid(petId)) {
            return null;
        }
        const updated = await this.model
            .findOneAndUpdate(
                { _id: new Types.ObjectId(petId), isActive: true },
                { $inc: { viewCount: 1 } },
                { new: true, projection: { viewCount: 1 } },
            )
            .exec();
        return updated?.viewCount ?? null;
    }
}
