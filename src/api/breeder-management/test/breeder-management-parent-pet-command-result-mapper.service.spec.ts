import { BreederManagementParentPetCommandResultMapperService } from '../domain/services/breeder-management-parent-pet-command-result-mapper.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';

describe('브리더 관리 부모견 명령 결과 매퍼', () => {
    const service = new BreederManagementParentPetCommandResultMapperService();

    it('부모견 생성과 수정 삭제 결과를 만든다', () => {
        expect(service.toParentPetAddedResult('parent-pet-id')).toEqual({
            petId: 'parent-pet-id',
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetAddedDetailed,
        });

        expect(service.toParentPetUpdatedResult()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetUpdatedDetailed,
        });

        expect(service.toParentPetRemovedResult()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetRemovedDetailed,
        });
    });
});
