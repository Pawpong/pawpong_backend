import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/standard-question-admin-response-messages';

describe('표준 질문 관리자 시드 명령 응답 메시지 상수', () => {
    it('재정렬과 재시드 메시지 계약을 유지한다', () => {
        expect(STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReordered).toBe('표준 질문 순서가 변경되었습니다.');
        expect(STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReseeded).toBe('표준 질문이 재시딩되었습니다.');
    });
});
