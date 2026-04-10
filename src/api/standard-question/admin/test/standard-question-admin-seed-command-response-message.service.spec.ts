import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/standard-question-admin-response-messages';
import { StandardQuestionAdminSeedCommandResponseMessageService } from '../domain/services/standard-question-admin-seed-command-response-message.service';

describe('표준 질문 관리자 시드 명령 응답 메시지 서비스', () => {
    const service = new StandardQuestionAdminSeedCommandResponseMessageService();

    it('재정렬과 재시드 메시지 계약을 유지한다', () => {
        expect(service.standardQuestionsReordered()).toBe(
            STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReordered,
        );
        expect(service.standardQuestionsReseeded()).toBe(
            STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReseeded,
        );
    });
});
