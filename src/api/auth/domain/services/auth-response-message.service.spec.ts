import {
    AUTH_RESPONSE_MESSAGE_EXAMPLES,
    AuthResponseMessageService,
    buildAuthBreederDocumentsUploadMessage,
} from './auth-response-message.service';

describe('AuthResponseMessageService', () => {
    const service = new AuthResponseMessageService();

    it('역할별 회원가입 메시지를 반환한다', () => {
        expect(service.getSignupCompleted('adopter')).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.adopterSignupCompleted);
        expect(service.getSignupCompleted('breeder')).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.breederSignupCompleted);
    });

    it('소셜 회원가입 완료 메시지를 반환한다', () => {
        expect(service.getSocialRegistrationCompleted()).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.socialRegistrationCompleted,
        );
    });

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

    it('소셜 유저 조회와 배너 조회 메시지를 반환한다', () => {
        expect(service.getSocialUserCheckMessage(true)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserFound);
        expect(service.getSocialUserCheckMessage(false)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserNotFound);
        expect(service.getBannerListed('login')).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.loginBannersListed);
        expect(service.getBannerListed('signup')).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.registerBannersListed);
    });

    it('브리더 서류 업로드 메시지를 상황별로 만든다', () => {
        expect(buildAuthBreederDocumentsUploadMessage('new', 2)).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.breederDocumentsUploaded,
        );
        expect(buildAuthBreederDocumentsUploadMessage('new', 2, 'temp-1')).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.breederDocumentsUploadedAndTempStored,
        );
    });
});
