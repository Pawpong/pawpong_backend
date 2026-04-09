import { BreederManagementApplicationStatusResponseService } from '../domain/services/breeder-management-application-status-response.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../domain/services/breeder-management-response-message.service';

describe('브리더 관리 신청 상태 응답 서비스', () => {
    const service = new BreederManagementApplicationStatusResponseService();

    it('신청 상태 변경 응답을 만든다', () => {
        expect(service.createApplicationStatusUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationStatusUpdatedDetailed,
        });
    });
});
