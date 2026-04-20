import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { StandardQuestionResultMapperService } from '../../../domain/services/standard-question-result-mapper.service';
import { STANDARD_QUESTION_WRITER_PORT, type StandardQuestionWriterPort } from '../ports/standard-question-writer.port';
import type { StandardQuestionResult } from '../types/standard-question-result.type';

@Injectable()
export class ToggleStandardQuestionStatusUseCase {
    constructor(
        @Inject(STANDARD_QUESTION_WRITER_PORT)
        private readonly standardQuestionWriter: StandardQuestionWriterPort,
        private readonly standardQuestionResultMapperService: StandardQuestionResultMapperService,
    ) {}

    async execute(id: string, isActive: boolean): Promise<StandardQuestionResult> {
        const question = await this.standardQuestionWriter.updateStatus(id, isActive);

        if (!question) {
            throw new DomainNotFoundError('해당 질문을 찾을 수 없습니다.');
        }

        return this.standardQuestionResultMapperService.toResult(question);
    }
}
