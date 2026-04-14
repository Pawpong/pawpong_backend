import { BreederManagementAvailablePetStatusResultMapperService } from '../domain/services/breeder-management-available-pet-status-result-mapper.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';

describe('브리더 관리 분양 개체 상태 결과 매퍼', () => {
    const service = new BreederManagementAvailablePetStatusResultMapperService();

    it('분양 개체 상태 변경 결과를 만든다', () => {
        expect(service.toAvailablePetStatusUpdatedResult()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.petStatusUpdatedDetailed,
        });
    });
});
