import { BreederManagementAvailablePetCommandResultMapperService } from '../domain/services/breeder-management-available-pet-command-result-mapper.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';

describe('브리더 관리 분양 개체 명령 결과 매퍼', () => {
    const service = new BreederManagementAvailablePetCommandResultMapperService();

    it('분양 개체 생성과 수정 삭제 결과를 만든다', () => {
        expect(service.toAvailablePetAddedResult('available-pet-id')).toEqual({
            petId: 'available-pet-id',
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetAddedDetailed,
        });

        expect(service.toAvailablePetUpdatedResult()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetUpdatedDetailed,
        });

        expect(service.toAvailablePetRemovedResult()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetRemovedDetailed,
        });
    });
});
