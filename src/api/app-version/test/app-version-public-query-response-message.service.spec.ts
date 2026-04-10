import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/app-version-response-messages';
import { AppVersionPublicQueryResponseMessageService } from '../domain/services/app-version-public-query-response-message.service';

describe('앱 버전 공개 조회 응답 메시지 서비스', () => {
    const service = new AppVersionPublicQueryResponseMessageService();

    it('공개 버전 체크 메시지 계약을 유지한다', () => {
        expect(service.versionChecked()).toBe(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.versionChecked);
    });
});
