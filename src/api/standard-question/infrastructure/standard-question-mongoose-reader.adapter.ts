import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { StandardQuestion } from '../../../schema/standard-question.schema';
import { StandardQuestionReaderPort, StandardQuestionSnapshot } from '../application/ports/standard-question-reader.port';

@Injectable()
export class StandardQuestionMongooseReaderAdapter implements StandardQuestionReaderPort {
    constructor(@InjectModel(StandardQuestion.name) private readonly standardQuestionModel: Model<StandardQuestion>) {}

    async readAll(): Promise<StandardQuestionSnapshot[]> {
        const questions = await this.standardQuestionModel.find().sort({ order: 1 }).lean().exec();
        return questions.map((question) => this.toSnapshot(question));
    }

    async readActive(): Promise<StandardQuestionSnapshot[]> {
        const questions = await this.standardQuestionModel.find({ isActive: true }).sort({ order: 1 }).lean().exec();
        return questions.map((question) => this.toSnapshot(question));
    }

    async findById(id: string): Promise<StandardQuestionSnapshot | null> {
        const question = await this.standardQuestionModel.findOne({ id }).lean().exec();
        return question ? this.toSnapshot(question) : null;
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
