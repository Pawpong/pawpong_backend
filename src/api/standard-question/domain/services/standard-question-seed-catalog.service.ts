import { Injectable } from '@nestjs/common';

import { STANDARD_QUESTIONS } from '../../../../common/data/standard-questions.data';
import { StandardQuestionSnapshot } from '../../application/ports/standard-question-reader.port';

@Injectable()
export class StandardQuestionSeedCatalogService {
    getAll(): StandardQuestionSnapshot[] {
        return STANDARD_QUESTIONS.map((question) => ({ ...question }));
    }
}
