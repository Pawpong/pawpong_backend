import { BreederManagementApplicationStatusResultMapperService } from '../../../domain/services/breeder-management-application-status-result-mapper.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../../constants/breeder-management-response-messages';

describe('브리더 관리 신청 상태 결과 매퍼', () => {
    const service = new BreederManagementApplicationStatusResultMapperService();

    it('신청 상태 변경 결과를 만든다', () => {
        expect(service.toApplicationStatusUpdatedResult()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationStatusUpdatedDetailed,
        });
    });
});
