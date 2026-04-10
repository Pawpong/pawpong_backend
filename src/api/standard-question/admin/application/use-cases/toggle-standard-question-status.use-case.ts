import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { StandardQuestionPresentationService } from '../../../domain/services/standard-question-presentation.service';
import { STANDARD_QUESTION_WRITER, type StandardQuestionWriterPort } from '../ports/standard-question-writer.port';
import type { StandardQuestionResult } from '../types/standard-question-result.type';

@Injectable()
export class ToggleStandardQuestionStatusUseCase {
    constructor(
        @Inject(STANDARD_QUESTION_WRITER)
        private readonly standardQuestionWriter: StandardQuestionWriterPort,
        private readonly standardQuestionPresentationService: StandardQuestionPresentationService,
    ) {}

    async execute(id: string, isActive: boolean): Promise<StandardQuestionResult> {
        const question = await this.standardQuestionWriter.updateStatus(id, isActive);

        if (!question) {
            throw new BadRequestException('해당 질문을 찾을 수 없습니다.');
        }

        return this.standardQuestionPresentationService.toResult(question);
    }
}
