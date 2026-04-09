import { BreederManagementProfileCommandResponseService } from '../domain/services/breeder-management-profile-command-response.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../domain/services/breeder-management-response-message.service';

describe('브리더 관리 프로필 명령 응답 서비스', () => {
    const service = new BreederManagementProfileCommandResponseService();

    it('프로필과 인증 관련 message 응답을 만든다', () => {
        expect(service.createProfileUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileUpdated,
        });

        expect(service.createVerificationSubmitted()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationSubmittedDetailed,
        });

        expect(service.createVerificationDocumentsSubmitted()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationDocumentsSubmittedDetailed,
        });
    });
});
