import { BreederManagementAvailablePetCommandResponseService } from '../domain/services/breeder-management-available-pet-command-response.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';

describe('브리더 관리 분양 개체 응답 서비스', () => {
    const service = new BreederManagementAvailablePetCommandResponseService();

    it('분양 개체 생성과 수정 삭제 응답을 만든다', () => {
        expect(service.createAvailablePetAdded('available-pet-id')).toEqual({
            petId: 'available-pet-id',
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetAddedDetailed,
        });

        expect(service.createAvailablePetUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetUpdatedDetailed,
        });

        expect(service.createAvailablePetRemoved()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetRemovedDetailed,
        });
    });
});
