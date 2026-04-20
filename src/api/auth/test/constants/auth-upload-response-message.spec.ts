import {
    AUTH_RESPONSE_MESSAGE_EXAMPLES,
    buildAuthBreederDocumentsUploadMessage,
    buildAuthProfileUploadMessage,
} from '../../constants/auth-response-messages';

describe('인증 업로드 응답 메시지 상수', () => {
    it('프로필 업로드 메시지를 상황별로 반환한다', () => {
        expect(buildAuthProfileUploadMessage(true)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.profileImageUploadedAndSaved);
        expect(buildAuthProfileUploadMessage(false, 'temp-id')).toBe(
            AUTH_RESPONSE_MESSAGE_EXAMPLES.profileImageUploadedAndTempStored,
        );
        expect(buildAuthProfileUploadMessage(false)).toBe(AUTH_RESPONSE_MESSAGE_EXAMPLES.profileImageUploaded);
    });

    it('브리더 서류 업로드 메시지를 tempId 유무에 맞게 반환한다', () => {
        expect(buildAuthBreederDocumentsUploadMessage('new', 2)).toBe('new 레벨 브리더 인증 서류 2개가 업로드되었습니다.');
        expect(buildAuthBreederDocumentsUploadMessage('new', 2, 'temp-id')).toBe(
            'new 레벨 브리더 인증 서류 2개가 업로드되고 임시 저장되었습니다. 회원가입 시 자동으로 적용됩니다.',
        );
    });
});
