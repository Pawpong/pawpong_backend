import { Inject, Injectable } from '@nestjs/common';

import {
    STANDARD_QUESTION_READER_PORT,
    type StandardQuestionReaderPort,
} from '../../../application/ports/standard-question-reader.port';
import { StandardQuestionResultMapperService } from '../../../domain/services/standard-question-result-mapper.service';
import type { StandardQuestionResult } from '../types/standard-question-result.type';

@Injectable()
export class GetAllStandardQuestionsUseCase {
    constructor(
        @Inject(STANDARD_QUESTION_READER_PORT)
        private readonly standardQuestionReader: StandardQuestionReaderPort,
        private readonly standardQuestionResultMapperService: StandardQuestionResultMapperService,
    ) {}

    async execute(): Promise<StandardQuestionResult[]> {
        const questions = await this.standardQuestionReader.readAll();
        return questions.map((question) => this.standardQuestionResultMapperService.toResult(question));
    }
}
