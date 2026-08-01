import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AiImageFilter, AiImageFilterDocument } from '../../../../schema/ai-image-filter.schema';
import type { AiImageFilterCreateCommand, AiImageFilterUpdateCommand } from '../application/types/ai-image-admin-filter-command.type';

/** AI 필터 쓰기 전용 영속성 (어드민) */
@Injectable()
export class AiImageAdminFilterRepository {
    constructor(
        @InjectModel(AiImageFilter.name)
        private readonly filterModel: Model<AiImageFilterDocument>,
    ) {}

    async create(data: AiImageFilterCreateCommand): Promise<AiImageFilterDocument> {
        const created = await this.filterModel.create(data);
        return created.toObject() as AiImageFilterDocument;
    }

    update(filterId: string, data: AiImageFilterUpdateCommand): Promise<AiImageFilterDocument | null> {
        if (!Types.ObjectId.isValid(filterId)) return Promise.resolve(null);
        return this.filterModel
            .findByIdAndUpdate(filterId, { $set: data }, { new: true })
            .lean<AiImageFilterDocument>()
            .exec();
    }

    async delete(filterId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(filterId)) return false;
        const result = await this.filterModel.deleteOne({ _id: new Types.ObjectId(filterId) }).exec();
        return result.deletedCount > 0;
    }
}
