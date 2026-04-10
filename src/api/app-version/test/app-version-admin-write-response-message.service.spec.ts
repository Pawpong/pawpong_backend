import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/app-version-response-messages';
import { AppVersionAdminWriteResponseMessageService } from '../domain/services/app-version-admin-write-response-message.service';

describe('앱 버전 관리자 쓰기 응답 메시지 서비스', () => {
    const service = new AppVersionAdminWriteResponseMessageService();

    it('생성과 수정 메시지 계약을 유지한다', () => {
        expect(service.appVersionCreated()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionCreated);
        expect(service.appVersionUpdated()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionUpdated);
    });
});
