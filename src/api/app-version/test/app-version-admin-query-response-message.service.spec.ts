import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/app-version-response-messages';
import { AppVersionAdminQueryResponseMessageService } from '../domain/services/app-version-admin-query-response-message.service';

describe('앱 버전 관리자 조회 응답 메시지 서비스', () => {
    const service = new AppVersionAdminQueryResponseMessageService();

    it('관리자 목록 조회 메시지 계약을 유지한다', () => {
        expect(service.appVersionListRetrieved()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionListRetrieved);
    });
});
