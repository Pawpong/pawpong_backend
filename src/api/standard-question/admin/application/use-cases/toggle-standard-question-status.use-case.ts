import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { StandardQuestionResponseDto } from '../../dto/response/standard-question-response.dto';
import { StandardQuestionPresentationService } from '../../../domain/services/standard-question-presentation.service';
import { STANDARD_QUESTION_WRITER, type StandardQuestionWriterPort } from '../ports/standard-question-writer.port';

@Injectable()
export class ToggleStandardQuestionStatusUseCase {
    constructor(
        @Inject(STANDARD_QUESTION_WRITER)
        private readonly standardQuestionWriter: StandardQuestionWriterPort,
        private readonly standardQuestionPresentationService: StandardQuestionPresentationService,
    ) {}

    async execute(id: string, isActive: boolean): Promise<StandardQuestionResponseDto> {
        const question = await this.standardQuestionWriter.updateStatus(id, isActive);

        if (!question) {
            throw new BadRequestException('해당 질문을 찾을 수 없습니다.');
        }

        return this.standardQuestionPresentationService.toResponseDto(question);
    }
}
