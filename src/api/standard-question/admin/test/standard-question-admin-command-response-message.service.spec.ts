import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/standard-question-admin-response-messages';
import { StandardQuestionAdminCommandResponseMessageService } from '../domain/services/standard-question-admin-command-response-message.service';

describe('표준 질문 관리자 명령 응답 메시지 서비스', () => {
    const service = new StandardQuestionAdminCommandResponseMessageService();

    it('관리자 명령 메시지 계약을 유지한다', () => {
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
