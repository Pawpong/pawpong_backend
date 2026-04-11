import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../../constants/auth-response-messages';

describe('인증 배너 응답 메시지 상수', () => {
    it('로그인과 회원가입 배너 조회 메시지를 반환한다', () => {
        expect(AUTH_RESPONSE_MESSAGE_EXAMPLES.loginBannersListed).toBe('로그인 페이지 배너가 조회되었습니다.');
        expect(AUTH_RESPONSE_MESSAGE_EXAMPLES.registerBannersListed).toBe('회원가입 페이지 배너가 조회되었습니다.');
    });
});
