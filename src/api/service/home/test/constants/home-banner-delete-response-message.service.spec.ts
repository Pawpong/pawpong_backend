import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/home-response-messages';

describe('홈 배너 삭제 응답 메시지 상수', () => {
    it('배너 삭제 메시지 계약을 유지한다', () => {
        expect(HOME_RESPONSE_MESSAGE_EXAMPLES.bannerDeleted).toBe('배너가 삭제되었습니다.');
    });
});
