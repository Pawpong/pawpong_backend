import { AuthSocialRegistrationResultMapperService } from '../../../domain/services/auth-social-registration-result-mapper.service';

const tokens = { accessToken: 'a', refreshToken: 'r', accessTokenExpiresIn: 3600, refreshTokenExpiresIn: 7200 } as any;

describe('AuthSocialRegistrationResultMapperService', () => {
    const service = new AuthSocialRegistrationResultMapperService();

    it('adopter는 nickname 우선', () => {
        const result = service.toResult(
            { _id: { toString: () => 'u-1' }, emailAddress: 'a@b.com', nickname: '닉', accountStatus: 'active' } as any,
            tokens,
            'adopter',
            '회원가입 성공',
        );
        expect(result.userInfo.nickname).toBe('닉');
        expect(result.userInfo.userRole).toBe('adopter');
    });

    it('breeder는 name 우선, 없으면 nickname', () => {
        const result = service.toResult(
            { _id: { toString: () => 'b-1' }, emailAddress: 'b@e.com', name: '브리더', accountStatus: 'active' } as any,
            tokens,
            'breeder',
            '브리더 회원가입',
        );
        expect(result.userInfo.nickname).toBe('브리더');

        const result2 = service.toResult(
            { _id: { toString: () => 'b-2' }, emailAddress: 'b@e.com', nickname: '닉', accountStatus: 'active' } as any,
            tokens,
            'breeder',
            'x',
        );
        expect(result2.userInfo.nickname).toBe('닉');
    });

    it('profileImageFileName이 없으면 undefined', () => {
        const result = service.toResult(
            { _id: { toString: () => 'u-1' }, emailAddress: 'a', nickname: '닉', accountStatus: 'active' } as any,
            tokens,
            'adopter',
            'm',
        );
        expect(result.userInfo.profileImageFileName).toBeUndefined();
    });
});
