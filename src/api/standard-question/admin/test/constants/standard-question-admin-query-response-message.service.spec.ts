import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/standard-question-admin-response-messages';

describe('표준 질문 관리자 조회 응답 메시지 상수', () => {
    it('관리자 조회 메시지 계약을 유지한다', () => {
        expect(STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsRetrieved).toBe('표준 질문 목록이 조회되었습니다.');
    });
});
