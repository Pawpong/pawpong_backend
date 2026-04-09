import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { AuthDuplicateCheckResponseMessageService } from './auth-duplicate-check-response-message.service';

describe('중복 체크 응답 메시지 서비스', () => {
    const service = new AuthDuplicateCheckResponseMessageService();

    it('중복 체크 메시지를 상황별로 반환한다', () => {
        expect(service.getDuplicateCheckMessage('email', false)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.emailAvailable);
        expect(service.getDuplicateCheckMessage('email', true)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.emailDuplicated);
        expect(service.getDuplicateCheckMessage('nickname', false)).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.nicknameAvailable,
        );
        expect(service.getDuplicateCheckMessage('nickname', true)).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.nicknameDuplicated,
        );
        expect(service.getDuplicateCheckMessage('breederName', false)).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.breederNameAvailable,
        );
        expect(service.getDuplicateCheckMessage('breederName', true)).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.breederNameDuplicated,
        );
    });
});
