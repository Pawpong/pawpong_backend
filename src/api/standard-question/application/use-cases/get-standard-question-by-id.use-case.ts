import { Inject, Injectable } from '@nestjs/common';

import { STANDARD_QUESTION_READER, type StandardQuestionReaderPort, type StandardQuestionSnapshot } from '../ports/standard-question-reader.port';

@Injectable()
export class GetStandardQuestionByIdUseCase {
    constructor(
        @Inject(STANDARD_QUESTION_READER)
        private readonly standardQuestionReader: StandardQuestionReaderPort,
    ) {}

    execute(id: string): Promise<StandardQuestionSnapshot | null> {
        return this.standardQuestionReader.findById(id);
    }
}
