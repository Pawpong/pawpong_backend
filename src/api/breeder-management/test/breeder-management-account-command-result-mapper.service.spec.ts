import { BreederManagementAccountCommandResultMapperService } from '../domain/services/breeder-management-account-command-result-mapper.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';

describe('브리더 관리 계정 명령 결과 매퍼', () => {
    const service = new BreederManagementAccountCommandResultMapperService();

    it('계정 탈퇴 결과를 일관된 형태로 만든다', () => {
        const deletedAt = new Date('2026-04-08T10:10:00.000Z');

        expect(service.toAccountDeletedResult('breeder-id', deletedAt)).toEqual({
            breederId: 'breeder-id',
            deletedAt: deletedAt.toISOString(),
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.accountDeleted,
        });
    });
});
