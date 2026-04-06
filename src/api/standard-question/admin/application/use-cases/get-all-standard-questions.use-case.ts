import { Inject, Injectable } from '@nestjs/common';

import { STANDARD_QUESTION_READER, type StandardQuestionReaderPort } from '../../../application/ports/standard-question-reader.port';
import { StandardQuestionResponseDto } from '../../dto/response/standard-question-response.dto';
import { StandardQuestionPresentationService } from '../../../domain/services/standard-question-presentation.service';

@Injectable()
export class GetAllStandardQuestionsUseCase {
    constructor(
        @Inject(STANDARD_QUESTION_READER)
        private readonly standardQuestionReader: StandardQuestionReaderPort,
        private readonly standardQuestionPresentationService: StandardQuestionPresentationService,
    ) {}

    async execute(): Promise<StandardQuestionResponseDto[]> {
        const questions = await this.standardQuestionReader.readAll();
        return questions.map((question) => this.standardQuestionPresentationService.toResponseDto(question));
    }
}
