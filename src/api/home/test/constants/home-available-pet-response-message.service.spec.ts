import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/home-response-messages';

describe('홈 분양 개체 응답 메시지 상수', () => {
    it('분양 개체 조회 메시지 계약을 유지한다', () => {
        expect(HOME_RESPONSE_MESSAGE_EXAMPLES.availablePetsRetrieved).toBe('분양중인 아이들이 조회되었습니다.');
    });
});
