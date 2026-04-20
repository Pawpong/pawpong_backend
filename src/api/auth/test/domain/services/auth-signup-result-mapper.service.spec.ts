import { AuthSignupResultMapperService } from '../../../domain/services/auth-signup-result-mapper.service';

const tokens = { accessToken: 'access', refreshToken: 'refresh' };

describe('AuthSignupResultMapperService', () => {
    const service = new AuthSignupResultMapperService();

    describe('toAdopterResult', () => {
        it('userRole=adopter, 토큰/기본필드 포함', () => {
            const result = service.toAdopterResult({
                _id: { toString: () => 'u-1' },
                emailAddress: 'a@b.com',
                nickname: '닉',
                phoneNumber: '010',
                profileImageFileName: 'img.png',
                accountStatus: 'active',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
            } as any, tokens);
            expect(result.userRole).toBe('adopter');
            expect(result.accessToken).toBe('access');
            expect(result.createdAt).toBe('2026-01-01T00:00:00.000Z');
        });

        it('nickname 없으면 빈 문자열', () => {
            const result = service.toAdopterResult({
                _id: { toString: () => 'u-1' },
                emailAddress: 'a@b.com',
                accountStatus: 'active',
            } as any, tokens);
            expect(result.nickname).toBe('');
            expect(result.profileImage).toBe('');
        });
    });

    describe('toBreederResult', () => {
        it('breederLocation은 city + district', () => {
            const result = service.toBreederResult({
                _id: { toString: () => 'b-1' },
                emailAddress: 'b@e.com',
                name: '브리더',
                petType: 'dog',
                breeds: ['푸들'],
                profile: { location: { city: '서울', district: '강남구' } },
                verification: { plan: 'pro', level: 'elite', status: 'reviewing' },
                accountStatus: 'active',
            } as any, tokens);
            expect(result.breederLocation).toBe('서울 강남구');
        });

        it('name 없고 nickname만 있으면 nickname 사용', () => {
            const result = service.toBreederResult({
                _id: { toString: () => 'b-1' },
                emailAddress: 'b@e.com',
                nickname: '닉',
                profile: { location: { city: '서울' } },
                accountStatus: 'active',
            } as any, tokens);
            expect(result.breederName).toBe('닉');
            expect(result.breederLocation).toBe('서울');
        });
    });
});
