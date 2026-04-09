import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/app-version-response-messages';
import { AppVersionCommandResponseMessageService } from '../domain/services/app-version-command-response-message.service';

describe('앱 버전 명령 응답 메시지 서비스', () => {
    const service = new AppVersionCommandResponseMessageService();

    it('생성, 수정, 삭제 메시지 계약을 유지한다', () => {
        expect(service.appVersionCreated()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionCreated);
        expect(service.appVersionUpdated()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionUpdated);
        expect(service.appVersionDeleted()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionDeleted);
    });
});
