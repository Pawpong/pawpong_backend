import { AuthAdminLoginResultMapperService } from '../../../domain/services/auth-admin-login-result-mapper.service';

describe('AuthAdminLoginResultMapperService', () => {
    const service = new AuthAdminLoginResultMapperService();

    it('admin 정보와 토큰을 결합한다', () => {
        const result = service.toResult(
            {
                adminId: 'a-1',
                email: 'a@b.com',
                name: '관리자',
                adminLevel: 'super_admin',
                permissions: { canManageUsers: true },
            } as any,
            { accessToken: 'access', refreshToken: 'refresh' },
        );
        expect(result).toEqual({
            adminId: 'a-1',
            email: 'a@b.com',
            name: '관리자',
            adminLevel: 'super_admin',
            permissions: { canManageUsers: true },
            accessToken: 'access',
            refreshToken: 'refresh',
        });
    });
});
