import { StandardQuestionAdminResponseMessageService } from '../domain/services/standard-question-admin-response-message.service';
import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/standard-question-admin-response-messages';

describe('표준 질문 관리자 응답 메시지 서비스', () => {
    const service = new StandardQuestionAdminResponseMessageService();

    it('관리자 응답 메시지 계약을 유지한다', () => {
        expect(service.standardQuestionsRetrieved()).toBe(
            STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsRetrieved,
        );
        expect(service.standardQuestionUpdated()).toBe(
            STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionUpdated,
        );
        expect(service.standardQuestionStatusUpdated()).toBe(
            STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionStatusUpdated,
        );
        expect(service.standardQuestionsReordered()).toBe(
            STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReordered,
        );
        expect(service.standardQuestionsReseeded()).toBe(
            STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReseeded,
        );
    });
});
