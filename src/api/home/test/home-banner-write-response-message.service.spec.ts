import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';

describe('홈 배너 쓰기 응답 메시지 상수', () => {
    it('배너 생성과 수정 메시지 계약을 유지한다', () => {
        expect(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerCreated).toBe('배너가 생성되었습니다.');
        expect(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerUpdated).toBe('배너가 수정되었습니다.');
    });
});
