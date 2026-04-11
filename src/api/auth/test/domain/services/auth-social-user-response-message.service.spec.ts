import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../../constants/auth-response-messages';

describe('소셜 유저 조회 응답 메시지 상수', () => {
    it('소셜 유저 조회 메시지를 반환한다', () => {
        expect(AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserFound).toBe('가입된 사용자입니다.');
        expect(AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserNotFound).toBe('미가입 사용자입니다.');
    });
});
