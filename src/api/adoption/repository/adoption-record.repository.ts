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
                    // 실제 승인 시점 추적: 신규 'approvedAt' 우선 → 기존 'updatedAt'(자동 timestamps,
                    // 마지막 변경 시각이므로 approved 상태에서 사실상 승인 시각) → 'appliedAt' 최종 fallback.
                    // 'processedAt' 은 schema 에 존재하지만 어떤 use-case 도 set 하지 않아 읽기 신뢰도가 없음 → 제외.
                    $addFields: {
                        adoptedAt: {
                            $ifNull: ['$approvedAt', { $ifNull: ['$updatedAt', '$appliedAt'] }],
                        },
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
