import { Injectable } from '@nestjs/common';

import { StandardQuestionDocument } from '../../../schema/standard-question.schema';
import { StandardQuestionReaderPort, StandardQuestionSnapshot } from '../application/ports/standard-question-reader.port';
import { StandardQuestionRepository } from '../repository/standard-question.repository';

@Injectable()
export class StandardQuestionMongooseReaderAdapter implements StandardQuestionReaderPort {
    constructor(private readonly standardQuestionRepository: StandardQuestionRepository) {}

    async readAll(): Promise<StandardQuestionSnapshot[]> {
        const questions = await this.standardQuestionRepository.findAll();
        return questions.map((question) => this.toSnapshot(question));
    }

    async readActive(): Promise<StandardQuestionSnapshot[]> {
        const questions = await this.standardQuestionRepository.findActive();
        return questions.map((question) => this.toSnapshot(question));
    }

    async findById(id: string): Promise<StandardQuestionSnapshot | null> {
        const question = await this.standardQuestionRepository.findByPublicId(id);
        return question ? this.toSnapshot(question) : null;
    }

    private toSnapshot(question: StandardQuestionDocument): StandardQuestionSnapshot {
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
