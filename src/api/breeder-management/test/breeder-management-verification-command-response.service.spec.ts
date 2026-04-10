import { BreederManagementVerificationCommandResponseService } from '../domain/services/breeder-management-verification-command-response.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';

describe('브리더 관리 인증 명령 응답 서비스', () => {
    const service = new BreederManagementVerificationCommandResponseService();

    it('인증 제출과 문서 제출 응답을 만든다', () => {
        expect(service.createVerificationSubmitted()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationSubmittedDetailed,
        });

        expect(service.createVerificationDocumentsSubmitted()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationDocumentsSubmittedDetailed,
        });
    });
});
