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

    it('브리더 서류 업로드 메시지를 상황별로 만든다', () => {
        expect(buildAuthBreederDocumentsUploadMessage('new', 2)).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.breederDocumentsUploaded,
        );
        expect(buildAuthBreederDocumentsUploadMessage('new', 2, 'temp-1')).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.breederDocumentsUploadedAndTempStored,
        );
    });
});
