import { BreederAdminSuspensionResultMapperService } from '../../../domain/services/breeder-admin-suspension-result-mapper.service';

describe('BreederAdminSuspensionResultMapperService', () => {
    const service = new BreederAdminSuspensionResultMapperService();

    it('정지 결과를 반환한다', () => {
        const at = new Date();
        const result = service.toResult('b-1', '사유', at, true);
        expect(result).toEqual({ breederId: 'b-1', reason: '사유', suspendedAt: at, notificationSent: true });
    });

    it('reason/suspendedAt이 undefined여도 처리한다', () => {
        const result = service.toResult('b-2', undefined, undefined, false);
        expect(result.reason).toBeUndefined();
        expect(result.suspendedAt).toBeUndefined();
    });
});
