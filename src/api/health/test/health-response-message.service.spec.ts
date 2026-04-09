import { HEALTH_RESPONSE_MESSAGE_EXAMPLES } from '../constants/health-response-messages';
import { HealthResponseMessageService } from '../domain/services/health-response-message.service';

describe('헬스 응답 메시지 서비스', () => {
    const service = new HealthResponseMessageService();

    it('헬스체크 메시지 계약을 유지한다', () => {
        expect(service.healthChecked()).toBe(HEALTH_RESPONSE_MESSAGE_EXAMPLES.healthChecked);
    });
});
