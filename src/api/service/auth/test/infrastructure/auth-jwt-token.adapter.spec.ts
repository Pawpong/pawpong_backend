import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError } from 'jsonwebtoken';

import { AuthJwtTokenAdapter } from '../../infrastructure/auth-jwt-token.adapter';

describe('AuthJwtTokenAdapter', () => {
    const makeAdapter = (expires: Record<string, string>) => {
        const jwtService = new JwtService({ secret: 'test-secret' });
        const configService = {
            get: jest.fn((key: string) => expires[key]),
        };

        return new AuthJwtTokenAdapter(jwtService, configService as never);
    };

    it('응답 만료 시간은 실제 JWT exp-iat 기준으로 반환한다', () => {
        const adapter = makeAdapter({
            JWT_EXPIRATION: '2h',
            JWT_REFRESH_EXPIRATION: '3d',
        });

        const tokens = adapter.generateTokens('user-1', 'user@test.com', 'adopter');

        expect(tokens.accessTokenExpiresIn).toBe(2 * 60 * 60);
        expect(tokens.refreshTokenExpiresIn).toBe(3 * 24 * 60 * 60);
    });

    it('refresh 엔드포인트에는 refresh 타입 토큰만 허용한다', () => {
        const adapter = makeAdapter({
            JWT_EXPIRATION: '2h',
            JWT_REFRESH_EXPIRATION: '3d',
        });
        const tokens = adapter.generateTokens('user-1', 'user@test.com', 'adopter');

        expect(() => adapter.verifyRefreshToken(tokens.accessToken)).toThrow(JsonWebTokenError);
        expect(adapter.verifyRefreshToken(tokens.refreshToken)).toMatchObject({
            sub: 'user-1',
            email: 'user@test.com',
            role: 'adopter',
            type: 'refresh',
        });
    });
});
