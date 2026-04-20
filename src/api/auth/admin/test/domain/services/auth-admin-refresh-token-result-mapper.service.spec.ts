import { AuthAdminRefreshTokenResultMapperService } from '../../../domain/services/auth-admin-refresh-token-result-mapper.service';

describe('AuthAdminRefreshTokenResultMapperService', () => {
    const service = new AuthAdminRefreshTokenResultMapperService();

    it('accessToken만 담은 결과를 반환한다', () => {
        expect(service.toResult('new-token')).toEqual({ accessToken: 'new-token' });
    });
});
