import { BreederManagementAccountCommandResponseService } from '../domain/services/breeder-management-account-command-response.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';

describe('브리더 관리 계정 명령 응답 서비스', () => {
    const service = new BreederManagementAccountCommandResponseService();

    it('계정 탈퇴 응답을 일관된 형태로 만든다', () => {
        const deletedAt = new Date('2026-04-08T10:10:00.000Z');

        expect(service.createAccountDeleted('breeder-id', deletedAt)).toEqual({
            breederId: 'breeder-id',
            deletedAt: deletedAt.toISOString(),
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.accountDeleted,
        });
    });
});
