import { BreederVerificationAdminCommandResultMapperService } from '../../../domain/services/breeder-verification-admin-command-result-mapper.service';

describe('브리더 인증 관리자 명령 결과 매퍼', () => {
    const service = new BreederVerificationAdminCommandResultMapperService();

    it('서류 리마인드 결과를 만든다', () => {
        expect(service.toDocumentReminderResult(2, ['breeder-1', 'breeder-2'])).toEqual({
            sentCount: 2,
            breederIds: ['breeder-1', 'breeder-2'],
        });
    });
});
