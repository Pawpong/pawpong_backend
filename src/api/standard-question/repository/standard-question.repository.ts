import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { StandardQuestion, StandardQuestionDocument } from '../../../schema/standard-question.schema';
import { StandardQuestionSnapshot } from '../application/ports/standard-question-reader.port';
import { UpdateStandardQuestionDto } from '../admin/dto/request/update-standard-question.dto';
import { StandardQuestionReorderCommand } from '../admin/application/ports/standard-question-writer.port';

@Injectable()
export class StandardQuestionRepository {
    constructor(
        @InjectModel(StandardQuestion.name)
        private readonly standardQuestionModel: Model<StandardQuestionDocument>,
    ) {}

    findAll(): Promise<StandardQuestionDocument[]> {
        return this.standardQuestionModel.find().sort({ order: 1 }).exec();
    }

    findActive(): Promise<StandardQuestionDocument[]> {
        return this.standardQuestionModel.find({ isActive: true }).sort({ order: 1 }).exec();
    }

    findByPublicId(id: string): Promise<StandardQuestionDocument | null> {
        return this.standardQuestionModel.findOne({ id }).exec();
    }

    update(id: string, updateData: UpdateStandardQuestionDto): Promise<StandardQuestionDocument | null> {
        return this.standardQuestionModel
            .findOneAndUpdate({ id }, { $set: updateData }, { new: true, runValidators: false })
            .exec();
    }

    updateStatus(id: string, isActive: boolean): Promise<StandardQuestionDocument | null> {
        return this.standardQuestionModel.findOneAndUpdate({ id }, { $set: { isActive } }, { new: true }).exec();
    }

    async reorder(reorderData: StandardQuestionReorderCommand[]): Promise<void> {
        await this.standardQuestionModel.bulkWrite(
            reorderData.map((item) => ({
                updateOne: {
                    filter: { id: item.id },
                    update: { $set: { order: item.order } },
                },
            })),
        );
    }

    async replaceAll(questions: StandardQuestionSnapshot[]): Promise<number> {
        await this.standardQuestionModel.deleteMany({});
        const inserted = await this.standardQuestionModel.insertMany(questions);
        return inserted.length;
    }
}
