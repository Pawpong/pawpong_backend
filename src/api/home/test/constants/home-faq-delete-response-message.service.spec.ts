import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/home-response-messages';

describe('홈 자주 묻는 질문 삭제 응답 메시지 상수', () => {
    it('자주 묻는 질문 삭제 메시지 계약을 유지한다', () => {
        expect(HOME_RESPONSE_MESSAGE_EXAMPLES.faqDeleted).toBe('FAQ가 삭제되었습니다.');
    });
});
