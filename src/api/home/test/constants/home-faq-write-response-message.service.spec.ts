import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/home-response-messages';

describe('홈 자주 묻는 질문 쓰기 응답 메시지 상수', () => {
    it('자주 묻는 질문 생성과 수정 메시지 계약을 유지한다', () => {
        expect(HOME_RESPONSE_MESSAGE_EXAMPLES.faqCreated).toBe('FAQ가 생성되었습니다.');
        expect(HOME_RESPONSE_MESSAGE_EXAMPLES.faqUpdated).toBe('FAQ가 수정되었습니다.');
    });
});
