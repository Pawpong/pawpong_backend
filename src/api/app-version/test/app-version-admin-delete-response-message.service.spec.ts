import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/app-version-response-messages';
import { AppVersionAdminDeleteResponseMessageService } from '../domain/services/app-version-admin-delete-response-message.service';

describe('앱 버전 관리자 삭제 응답 메시지 서비스', () => {
    const service = new AppVersionAdminDeleteResponseMessageService();

    it('삭제 메시지 계약을 유지한다', () => {
        expect(service.appVersionDeleted()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionDeleted);
    });
});
