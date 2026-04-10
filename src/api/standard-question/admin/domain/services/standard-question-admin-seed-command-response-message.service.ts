import { Injectable } from '@nestjs/common';

import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/standard-question-admin-response-messages';

@Injectable()
export class StandardQuestionAdminSeedCommandResponseMessageService {
    standardQuestionsReordered(): string {
        return STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReordered;
    }

    standardQuestionsReseeded(): string {
        return STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReseeded;
    }
}
