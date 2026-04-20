import { BreederManagementProfileCommandResultMapperService } from '../../../domain/services/breeder-management-profile-command-result-mapper.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../../constants/breeder-management-response-messages';

describe('브리더 관리 프로필 명령 결과 매퍼', () => {
    const service = new BreederManagementProfileCommandResultMapperService();

    it('프로필 수정 message 결과를 만든다', () => {
        expect(service.toProfileUpdatedResult()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileUpdated,
        });
    });
});
