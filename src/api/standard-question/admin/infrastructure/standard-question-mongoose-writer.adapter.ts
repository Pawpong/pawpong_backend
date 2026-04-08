import { Injectable } from '@nestjs/common';

import { StandardQuestionSnapshot } from '../../application/ports/standard-question-reader.port';
import { UpdateStandardQuestionDto } from '../dto/request/update-standard-question.dto';
import {
    StandardQuestionReorderCommand,
    StandardQuestionWriterPort,
} from '../application/ports/standard-question-writer.port';
import { StandardQuestionRepository } from '../../repository/standard-question.repository';

@Injectable()
export class StandardQuestionMongooseWriterAdapter implements StandardQuestionWriterPort {
    constructor(private readonly standardQuestionRepository: StandardQuestionRepository) {}

    async update(id: string, updateData: UpdateStandardQuestionDto): Promise<StandardQuestionSnapshot | null> {
        const question = await this.standardQuestionRepository.update(id, updateData);
        if (!question) {
            return null;
        }
        return this.toSnapshot(question);
    }

    async updateStatus(id: string, isActive: boolean): Promise<StandardQuestionSnapshot | null> {
        const question = await this.standardQuestionRepository.updateStatus(id, isActive);
        if (!question) {
            return null;
        }
        return this.toSnapshot(question);
    }

    async reorder(reorderData: StandardQuestionReorderCommand[]): Promise<void> {
        await this.standardQuestionRepository.reorder(reorderData);
    }

    async replaceAll(questions: StandardQuestionSnapshot[]): Promise<number> {
        return this.standardQuestionRepository.replaceAll(questions);
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
