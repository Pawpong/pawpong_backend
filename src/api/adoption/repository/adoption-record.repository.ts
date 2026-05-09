import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AdoptionApplication } from '../../../schema/adoption-application.schema';
import type { AvailablePetDocument } from '../../../schema/available-pet.schema';

interface AggregatedAdoptedDoc {
    pet: AvailablePetDocument;
    adoptedAt: Date;
}

@Injectable()
export class AdoptionRecordRepository {
    constructor(
        @InjectModel(AdoptionApplication.name)
        private readonly applicationModel: Model<AdoptionApplication>,
    ) {}

    /**
     * 입양 승인된(adoption_approved) 신청 목록을 펫과 join 해서 카드 데이터를 모아 반환.
     * 정렬은 입양 확정 시각(reviewedAt 또는 appliedAt fallback) desc.
     */
    async aggregateMyAdopted(adopterId: string, query: { skip: number; limit: number }): Promise<{
        docs: AggregatedAdoptedDoc[];
        totalItems: number;
    }> {
        if (!Types.ObjectId.isValid(adopterId)) {
            return { docs: [], totalItems: 0 };
        }

        const result = await this.applicationModel
            .aggregate<{
                items: AggregatedAdoptedDoc[];
                total: Array<{ count: number }>;
            }>([
                { $match: { adopterId: new Types.ObjectId(adopterId), status: 'adoption_approved' } },
                {
                    $addFields: {
                        adoptedAt: { $ifNull: ['$reviewedAt', '$appliedAt'] },
                    },
                },
                {
                    $lookup: {
                        from: 'available_pets',
                        localField: 'petId',
                        foreignField: '_id',
                        as: 'pet',
                    },
                },
                { $unwind: '$pet' },
                { $sort: { adoptedAt: -1 } },
                {
                    $facet: {
                        items: [
                            { $skip: query.skip },
                            { $limit: query.limit },
                            { $project: { _id: 0, pet: 1, adoptedAt: 1 } },
                        ],
                        total: [{ $count: 'count' }],
                    },
                },
            ])
            .exec();

        const facet = result[0];
        return {
            docs: facet?.items ?? [],
            totalItems: facet?.total?.[0]?.count ?? 0,
        };
    }
}
