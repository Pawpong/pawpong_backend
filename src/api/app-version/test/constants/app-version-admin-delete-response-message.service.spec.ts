import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/app-version-response-messages';

describe('앱 버전 관리자 삭제 응답 메시지 상수', () => {
    it('삭제 메시지 계약을 유지한다', () => {
        expect(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionDeleted).toBe('앱 버전이 삭제되었습니다.');
    });
});
