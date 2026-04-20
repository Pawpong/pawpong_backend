import { BreederAdminTestAccountResultMapperService } from '../../../domain/services/breeder-admin-test-account-result-mapper.service';

describe('BreederAdminTestAccountResultMapperService', () => {
    const service = new BreederAdminTestAccountResultMapperService();

    it('테스트 계정 상태 결과를 반환한다', () => {
        const at = new Date();
        const result = service.toResult('b-1', '브리더', true, at);
        expect(result).toEqual({ breederId: 'b-1', breederName: '브리더', isTestAccount: true, updatedAt: at });
    });
});
