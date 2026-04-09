import { Injectable } from '@nestjs/common';

import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/standard-question-admin-response-messages';

@Injectable()
export class StandardQuestionAdminCommandResponseMessageService {
    standardQuestionUpdated(): string {
        return STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionUpdated;
    }

    standardQuestionStatusUpdated(): string {
        return STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionStatusUpdated;
    }

    standardQuestionsReordered(): string {
        return STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReordered;
    }

    standardQuestionsReseeded(): string {
        return STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReseeded;
    }
}
