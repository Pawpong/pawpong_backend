import { PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/platform-admin-response-messages';
import { PlatformAdminResponseMessageService } from '../domain/services/platform-admin-response-message.service';

describe('플랫폼 관리자 응답 메시지 서비스', () => {
    const service = new PlatformAdminResponseMessageService();

    it('통계 응답 메시지 계약을 유지한다', () => {
        expect(service.platformStatsRetrieved()).toBe(
            PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES.platformStatsRetrieved,
        );
        expect(service.platformMvpStatsRetrieved()).toBe(
            PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES.platformMvpStatsRetrieved,
        );
    });
});
