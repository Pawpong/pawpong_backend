import { AUTH_RESPONSE_MESSAGE_EXAMPLES, buildAuthDuplicateCheckMessage } from '../../constants/auth-response-messages';

describe('중복 체크 응답 메시지 상수', () => {
    it('중복 체크 메시지를 상황별로 반환한다', () => {
        expect(buildAuthDuplicateCheckMessage('email', false)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.emailAvailable);
        expect(buildAuthDuplicateCheckMessage('email', true)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.emailDuplicated);
        expect(buildAuthDuplicateCheckMessage('nickname', false)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.nicknameAvailable);
        expect(buildAuthDuplicateCheckMessage('nickname', true)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.nicknameDuplicated);
        expect(buildAuthDuplicateCheckMessage('breederName', false)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.breederNameAvailable);
        expect(buildAuthDuplicateCheckMessage('breederName', true)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.breederNameDuplicated);
    });
});
