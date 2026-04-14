import {
    AUTH_RESPONSE_MESSAGE_EXAMPLES,
    buildAuthPhoneVerificationCodeSentResult,
    buildAuthPhoneVerificationCompletedResult,
} from '../../constants/auth-response-messages';

describe('전화번호 인증 응답 상수', () => {
    it('전화번호 인증코드 발송 응답을 만든다', () => {
        expect(buildAuthPhoneVerificationCodeSentResult()).toEqual({
            success: true,
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCodeSent,
        });
    });

    it('전화번호 인증 완료 응답을 만든다', () => {
        expect(buildAuthPhoneVerificationCompletedResult()).toEqual({
            success: true,
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCompleted,
        });
    });
});
