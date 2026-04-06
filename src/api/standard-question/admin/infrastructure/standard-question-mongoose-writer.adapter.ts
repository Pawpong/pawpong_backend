import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { StandardQuestion } from '../../../../schema/standard-question.schema';
import { StandardQuestionSnapshot } from '../../application/ports/standard-question-reader.port';
import { UpdateStandardQuestionDto } from '../dto/request/update-standard-question.dto';
import {
    StandardQuestionReorderCommand,
    StandardQuestionWriterPort,
} from '../application/ports/standard-question-writer.port';

@Injectable()
export class StandardQuestionMongooseWriterAdapter implements StandardQuestionWriterPort {
    constructor(@InjectModel(StandardQuestion.name) private readonly standardQuestionModel: Model<StandardQuestion>) {}

    async update(id: string, updateData: UpdateStandardQuestionDto): Promise<StandardQuestionSnapshot | null> {
        const question = await this.standardQuestionModel.findOne({ id }).exec();

        if (!question) {
            return null;
        }

        Object.assign(question, updateData);
        await question.save();

        return this.toSnapshot(question);
    }

    async updateStatus(id: string, isActive: boolean): Promise<StandardQuestionSnapshot | null> {
        const question = await this.standardQuestionModel.findOne({ id }).exec();

        if (!question) {
            return null;
        }

        question.isActive = isActive;
        await question.save();

        return this.toSnapshot(question);
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

    private toSnapshot(question: any): StandardQuestionSnapshot {
        return {
            id: question.id,
            type: question.type,
            label: question.label,
            required: question.required,
            order: question.order,
            isActive: question.isActive,
            options: question.options,
            placeholder: question.placeholder,
            description: question.description,
        };
    }
}
