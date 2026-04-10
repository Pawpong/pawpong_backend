import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/standard-question-admin-response-messages';
import { StandardQuestionAdminQuestionCommandResponseMessageService } from '../domain/services/standard-question-admin-question-command-response-message.service';

describe('표준 질문 관리자 문항 명령 응답 메시지 서비스', () => {
    const service = new StandardQuestionAdminQuestionCommandResponseMessageService();

    it('문항 수정과 상태 변경 메시지 계약을 유지한다', () => {
        expect(service.standardQuestionUpdated()).toBe(
            STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionUpdated,
        );
        expect(service.standardQuestionStatusUpdated()).toBe(
            STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionStatusUpdated,
        );
    });
});
