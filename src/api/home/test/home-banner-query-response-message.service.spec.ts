import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';

describe('홈 배너 조회 응답 메시지 상수', () => {
    it('배너 조회 메시지 계약을 유지한다', () => {
        expect(HOME_RESPONSE_MESSAGE_EXAMPLES.bannersRetrieved).toBe('배너 목록이 조회되었습니다.');
    });
});
