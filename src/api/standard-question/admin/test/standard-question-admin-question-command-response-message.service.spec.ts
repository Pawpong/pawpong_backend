import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/standard-question-admin-response-messages';

describe('표준 질문 관리자 문항 명령 응답 메시지 상수', () => {
    it('문항 수정과 상태 변경 메시지 계약을 유지한다', () => {
        expect(STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionUpdated).toBe('표준 질문이 수정되었습니다.');
        expect(STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionStatusUpdated).toBe('표준 질문 상태가 변경되었습니다.');
    });
});
