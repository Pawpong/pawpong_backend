import { BreederManagementProfileCommandResponseService } from '../domain/services/breeder-management-profile-command-response.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';

describe('브리더 관리 프로필 명령 응답 서비스', () => {
    const service = new BreederManagementProfileCommandResponseService();

    it('프로필 수정 message 응답을 만든다', () => {
        expect(service.createProfileUpdated()).toEqual({
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileUpdated,
        });
    });
});
