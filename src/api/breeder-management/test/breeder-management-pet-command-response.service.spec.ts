import { BreederManagementPetCommandResponseService } from '../domain/services/breeder-management-pet-command-response.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../domain/services/breeder-management-response-message.service';

describe('브리더 관리 개체 명령 응답 서비스', () => {
    const service = new BreederManagementPetCommandResponseService();

    it('개체 생성 응답에 개체 ID와 message를 함께 담는다', () => {
        expect(service.createParentPetAdded('parent-pet-id')).toEqual({
            petId: 'parent-pet-id',
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetAddedDetailed,
        });

        expect(service.createAvailablePetAdded('available-pet-id')).toEqual({
            petId: 'available-pet-id',
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetAddedDetailed,
        });
    });

    it('개체 수정과 삭제 응답을 만든다', () => {
        expect(service.createParentPetUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetUpdatedDetailed,
        });

        expect(service.createParentPetRemoved()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetRemovedDetailed,
        });

        expect(service.createAvailablePetUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetUpdatedDetailed,
        });

        expect(service.createAvailablePetRemoved()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetRemovedDetailed,
        });

        expect(service.createAvailablePetStatusUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.petStatusUpdatedDetailed,
        });
    });
});
