import { BreederManagementParentPetCommandResponseService } from '../domain/services/breeder-management-parent-pet-command-response.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../domain/services/breeder-management-response-message.service';

describe('브리더 관리 부모견 응답 서비스', () => {
    const service = new BreederManagementParentPetCommandResponseService();

    it('부모견 생성과 수정 삭제 응답을 만든다', () => {
        expect(service.createParentPetAdded('parent-pet-id')).toEqual({
            petId: 'parent-pet-id',
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetAddedDetailed,
        });

        expect(service.createParentPetUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetUpdatedDetailed,
        });

        expect(service.createParentPetRemoved()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetRemovedDetailed,
        });
    });
});
