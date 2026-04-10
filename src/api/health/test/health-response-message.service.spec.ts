import { HEALTH_RESPONSE_MESSAGE_EXAMPLES } from '../constants/health-response-messages';

describe('헬스 응답 메시지 상수', () => {
    it('헬스체크 메시지 계약을 유지한다', () => {
        expect(HEALTH_RESPONSE_MESSAGE_EXAMPLES.healthChecked).toBe('시스템이 정상 작동 중입니다.');
    });
});
