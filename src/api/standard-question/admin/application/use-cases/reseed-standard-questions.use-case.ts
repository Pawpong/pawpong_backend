import { Inject, Injectable } from '@nestjs/common';

import { STANDARD_QUESTION_WRITER, type StandardQuestionWriterPort } from '../ports/standard-question-writer.port';
import { StandardQuestionSeedCatalogService } from '../../../domain/services/standard-question-seed-catalog.service';

@Injectable()
export class ReseedStandardQuestionsUseCase {
    constructor(
        @Inject(STANDARD_QUESTION_WRITER)
        private readonly standardQuestionWriter: StandardQuestionWriterPort,
        private readonly standardQuestionSeedCatalogService: StandardQuestionSeedCatalogService,
    ) {}

    async execute(): Promise<{ message: string }> {
        const seedQuestions = this.standardQuestionSeedCatalogService.getAll();
        const insertedCount = await this.standardQuestionWriter.replaceAll(seedQuestions);

        return { message: `${insertedCount}개의 표준 질문이 재시딩되었습니다.` };
    }
}
