import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/app-version-response-messages';
import { AppVersionQueryResponseMessageService } from '../domain/services/app-version-query-response-message.service';

describe('앱 버전 조회 응답 메시지 서비스', () => {
    const service = new AppVersionQueryResponseMessageService();

    it('공개와 관리자 조회 경로가 같은 메시지 계약을 유지한다', () => {
        expect(service.versionChecked()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.versionChecked);
        expect(service.appVersionListRetrieved()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionListRetrieved);
    });
});
