import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/app-version-response-messages';

describe('앱 버전 관리자 쓰기 응답 메시지 상수', () => {
    it('생성과 수정 메시지 계약을 유지한다', () => {
        expect(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionCreated).toBe('앱 버전이 생성되었습니다.');
        expect(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionUpdated).toBe('앱 버전이 수정되었습니다.');
    });
});
