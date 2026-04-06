import { Inject, Injectable } from '@nestjs/common';

import { STANDARD_QUESTION_READER, type StandardQuestionReaderPort, type StandardQuestionSnapshot } from '../ports/standard-question-reader.port';

@Injectable()
export class GetAllActiveStandardQuestionsUseCase {
    constructor(
        @Inject(STANDARD_QUESTION_READER)
        private readonly standardQuestionReader: StandardQuestionReaderPort,
    ) {}

    execute(): Promise<StandardQuestionSnapshot[]> {
        return this.standardQuestionReader.readActive();
    }
}
