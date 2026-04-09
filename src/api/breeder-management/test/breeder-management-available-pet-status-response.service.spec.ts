import { BreederManagementAvailablePetStatusResponseService } from '../domain/services/breeder-management-available-pet-status-response.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../domain/services/breeder-management-response-message.service';

describe('브리더 관리 분양 개체 상태 응답 서비스', () => {
    const service = new BreederManagementAvailablePetStatusResponseService();

    it('분양 개체 상태 변경 응답을 만든다', () => {
        expect(service.createAvailablePetStatusUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.petStatusUpdatedDetailed,
        });
    });
});
