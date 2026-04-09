import { Injectable } from '@nestjs/common';

import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/standard-question-admin-response-messages';

@Injectable()
export class StandardQuestionAdminQueryResponseMessageService {
    standardQuestionsRetrieved(): string {
        return STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsRetrieved;
    }
}
