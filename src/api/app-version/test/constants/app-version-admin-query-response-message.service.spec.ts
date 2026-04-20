import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/app-version-response-messages';

describe('앱 버전 관리자 조회 응답 메시지 상수', () => {
    it('관리자 목록 조회 메시지 계약을 유지한다', () => {
        expect(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionListRetrieved).toBe('앱 버전 목록 조회 성공');
    });
});
