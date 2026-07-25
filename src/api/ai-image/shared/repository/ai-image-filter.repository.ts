import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AiImageFilter, AiImageFilterDocument } from '../../../../schema/ai-image-filter.schema';

/**
 * AI 필터 영속성 접근.
 * 도큐먼트를 그대로 반환하고, 스냅샷 매핑은 어댑터가 담당한다.
 */
@Injectable()
export class AiImageFilterRepository {
    constructor(
        @InjectModel(AiImageFilter.name)
        private readonly filterModel: Model<AiImageFilterDocument>,
    ) {}

    findActive(): Promise<AiImageFilterDocument[]> {
        return this.filterModel
            .find({ isActive: true })
            .sort({ sortOrder: 1, createdAt: 1 })
            .lean<AiImageFilterDocument[]>()
            .exec();
    }

    findAll(): Promise<AiImageFilterDocument[]> {
        return this.filterModel
            .find()
            .sort({ sortOrder: 1, createdAt: 1 })
            .lean<AiImageFilterDocument[]>()
            .exec();
    }

    findById(filterId: string): Promise<AiImageFilterDocument | null> {
        if (!Types.ObjectId.isValid(filterId)) return Promise.resolve(null);
        return this.filterModel.findById(filterId).lean<AiImageFilterDocument>().exec();
    }
}
