import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/app-version-response-messages';
import { AppVersionResponseMessageService } from '../domain/services/app-version-response-message.service';

describe('앱 버전 응답 메시지 서비스', () => {
    const service = new AppVersionResponseMessageService();

    it('공개와 관리자 경로가 같은 메시지 계약을 유지한다', () => {
        expect(service.versionChecked()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.versionChecked);
        expect(service.appVersionListRetrieved()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionListRetrieved);
        expect(service.appVersionCreated()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionCreated);
        expect(service.appVersionUpdated()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionUpdated);
        expect(service.appVersionDeleted()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionDeleted);
    });
});
