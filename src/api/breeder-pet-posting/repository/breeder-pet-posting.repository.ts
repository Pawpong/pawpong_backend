import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import type {
    BreederPetPostingCreatePersistData,
    BreederPetPostingUpdatePersistData,
} from '../application/types/breeder-pet-posting-command.type';

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

    /**
     * 본인 분양글만 갱신. petId+breederId+isActive=true 매칭 필터로 단일 updateOne.
     * 매칭이 0건이면 changed=false (다른 브리더 소유 / 비활성 / 미존재 모두 동일하게 처리).
     */
    async updateByOwner(
        petId: string,
        breederId: string,
        patch: BreederPetPostingUpdatePersistData,
    ): Promise<{ changed: boolean }> {
        if (!Types.ObjectId.isValid(petId) || !Types.ObjectId.isValid(breederId)) {
            return { changed: false };
        }

        const $set: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(patch)) {
            if (value !== undefined) {
                $set[key] = value;
            }
        }

        if (Object.keys($set).length === 0) {
            // 빈 patch 는 본인 글 존재 여부만 확인 — idempotent
            const exists = await this.availablePetModel.exists({
                _id: new Types.ObjectId(petId),
                breederId: new Types.ObjectId(breederId),
                isActive: true,
            });
            return { changed: Boolean(exists) };
        }

        const result = await this.availablePetModel
            .updateOne(
                {
                    _id: new Types.ObjectId(petId),
                    breederId: new Types.ObjectId(breederId),
                    isActive: true,
                },
                { $set },
            )
            .exec();

        return { changed: result.matchedCount > 0 };
    }

    /**
     * 본인 분양글 soft delete — isActive=false.
     * 다른 도메인(상담 신청/즐겨찾기 등)이 참조하므로 도큐먼트는 보존한다.
     */
    async softDeleteByOwner(petId: string, breederId: string): Promise<{ changed: boolean }> {
        if (!Types.ObjectId.isValid(petId) || !Types.ObjectId.isValid(breederId)) {
            return { changed: false };
        }
        const result = await this.availablePetModel
            .updateOne(
                {
                    _id: new Types.ObjectId(petId),
                    breederId: new Types.ObjectId(breederId),
                    isActive: true,
                },
                { $set: { isActive: false } },
            )
            .exec();
        return { changed: result.modifiedCount > 0 };
    }
}
