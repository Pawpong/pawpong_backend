import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/standard-question-admin-response-messages';
import { StandardQuestionAdminQueryResponseMessageService } from '../domain/services/standard-question-admin-query-response-message.service';

describe('표준 질문 관리자 조회 응답 메시지 서비스', () => {
    const service = new StandardQuestionAdminQueryResponseMessageService();

    it('관리자 조회 메시지 계약을 유지한다', () => {
        expect(service.standardQuestionsRetrieved()).toBe(
            STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsRetrieved,
        );
    });
});
