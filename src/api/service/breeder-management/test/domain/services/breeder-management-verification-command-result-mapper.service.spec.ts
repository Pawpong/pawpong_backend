import { BreederManagementVerificationCommandResultMapperService } from '../../../domain/services/breeder-management-verification-command-result-mapper.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../../constants/breeder-management-response-messages';

describe('브리더 관리 인증 명령 결과 매퍼', () => {
    const service = new BreederManagementVerificationCommandResultMapperService();

    it('인증 제출과 문서 제출 결과를 만든다', () => {
        expect(service.toVerificationSubmittedResult()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationSubmittedDetailed,
        });

        expect(service.toVerificationDocumentsSubmittedResult()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationDocumentsSubmittedDetailed,
        });
    });
});
