import { Inject, Injectable } from '@nestjs/common';

import { STANDARD_QUESTION_WRITER_PORT, type StandardQuestionReorderCommand, type StandardQuestionWriterPort } from '../ports/standard-question-writer.port';

@Injectable()
export class ReorderStandardQuestionsUseCase {
    constructor(
        @Inject(STANDARD_QUESTION_WRITER_PORT)
        private readonly standardQuestionWriter: StandardQuestionWriterPort,
    ) {}

    async execute(reorderData: StandardQuestionReorderCommand[]): Promise<{ message: string }> {
        await this.standardQuestionWriter.reorder(reorderData);
        return { message: '질문 순서가 성공적으로 변경되었습니다.' };
    }
}
