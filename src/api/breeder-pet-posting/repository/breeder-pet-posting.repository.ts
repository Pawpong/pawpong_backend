import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import type { BreederPetPostingCreatePersistData } from '../application/types/breeder-pet-posting-command.type';

export type BreederPetPostingStatus = 'available' | 'reserved' | 'adopted';

export interface BreederPetPostingListFilter {
    breederId: string;
    status?: BreederPetPostingStatus;
    skip: number;
    limit: number;
}

/**
 * v2 분양글 — Mongoose 직접 접근을 캡슐화한다.
 * adapter 는 본 repository 만 사용하고 InjectModel 을 직접 참조하지 않는다.
 */
@Injectable()
export class BreederPetPostingRepository {
    constructor(
        @InjectModel(AvailablePet.name)
        private readonly availablePetModel: Model<AvailablePetDocument>,
    ) {}

    async create(data: BreederPetPostingCreatePersistData): Promise<{ _id: string }> {
        const created = await this.availablePetModel.create(data);
        return { _id: String(created._id) };
    }

    async listMyPostings(
        filter: BreederPetPostingListFilter,
    ): Promise<{ docs: AvailablePetDocument[]; totalItems: number }> {
        if (!Types.ObjectId.isValid(filter.breederId)) {
            return { docs: [], totalItems: 0 };
        }

        const query: FilterQuery<AvailablePet> = {
            breederId: new Types.ObjectId(filter.breederId),
            isActive: true,
        };
        if (filter.status) {
            query.status = filter.status;
        }

        const [docs, totalItems] = await Promise.all([
            this.availablePetModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(filter.skip)
                .limit(filter.limit)
                .lean<AvailablePetDocument[]>()
                .exec(),
            this.availablePetModel.countDocuments(query).exec(),
        ]);

        return { docs, totalItems };
    }
}
