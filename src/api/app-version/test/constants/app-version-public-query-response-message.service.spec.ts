import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/app-version-response-messages';

describe('앱 버전 공개 조회 응답 메시지 상수', () => {
    it('공개 버전 체크 메시지 계약을 유지한다', () => {
        expect(APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.versionChecked).toBe('버전 체크 완료');
    });
});
