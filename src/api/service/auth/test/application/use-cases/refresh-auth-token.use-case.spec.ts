import { DomainAuthenticationError } from '../../../../../../common/error/domain.error';

import { RefreshAuthTokenUseCase } from '../../../application/use-cases/refresh-auth-token.use-case';
import { type AuthSessionPort } from '../../../application/ports/auth-session.port';
import { type AuthTokenPort } from '../../../application/ports/auth-token.port';
import { AuthSessionAuthenticationService } from '../../../domain/services/auth-session-authentication.service';

describe('인증 토큰 재발급 유스케이스', () => {
    it.each(['suspended', 'deleted'])(
        '%s 계정은 유효한 refresh hash가 남아 있어도 재발급하지 않는다',
        async (accountStatus) => {
            const session = {
                findById: jest
                    .fn()
                    .mockResolvedValue({ id: 'user-1', role: 'adopter', accountStatus, refreshTokenHash: 'old-hash' }),
                updateRefreshToken: jest.fn(),
            };
            const token = {
                verifyRefreshToken: jest.fn().mockReturnValue({ sub: 'user-1', role: 'adopter' }),
                generateTokens: jest.fn(),
                compareRefreshToken: jest.fn(),
            };
            const useCase = new RefreshAuthTokenUseCase(
                session,
                token as never,
                new AuthSessionAuthenticationService(),
            );
            await expect(useCase.execute('old-refresh')).rejects.toBeInstanceOf(DomainAuthenticationError);
            expect(token.generateTokens).not.toHaveBeenCalled();
            expect(token.compareRefreshToken).not.toHaveBeenCalled();
            expect(session.updateRefreshToken).not.toHaveBeenCalled();
        },
    );
    it('리프레시 토큰 문자열로 새 토큰을 발급한다', async () => {
        const authSessionPort: AuthSessionPort = {
            findById: jest.fn().mockResolvedValue({
                id: 'user-1',
                email: 'user@test.com',
                role: 'adopter',
                refreshTokenHash: 'hashed-token',
            }),
            updateRefreshToken: jest.fn().mockResolvedValue(undefined),
        };

        const authTokenPort: AuthTokenPort = {
            generateTokens: jest.fn().mockReturnValue({
                accessToken: 'new-access',
                refreshToken: 'new-refresh',
                accessTokenExpiresIn: 3600,
                refreshTokenExpiresIn: 604800,
            }),
            verifyRefreshToken: jest.fn().mockReturnValue({
                sub: 'user-1',
                email: 'user@test.com',
                role: 'adopter',
                type: 'refresh',
            }),
            hashRefreshToken: jest.fn().mockResolvedValue('new-hashed-token'),
            generateReactivationToken: jest.fn(),
            verifyReactivationToken: jest.fn(),
            compareRefreshToken: jest.fn().mockResolvedValue(true),
        };

        const useCase = new RefreshAuthTokenUseCase(
            authSessionPort,
            authTokenPort,
            new AuthSessionAuthenticationService(),
        );

        await expect(useCase.execute('refresh-token-value')).resolves.toEqual({
            accessToken: 'new-access',
            refreshToken: 'new-refresh',
            accessTokenExpiresIn: 3600,
            refreshTokenExpiresIn: 604800,
        });

        expect(authTokenPort.verifyRefreshToken).toHaveBeenCalledWith('refresh-token-value');
        expect(authTokenPort.compareRefreshToken).toHaveBeenCalledWith('refresh-token-value', 'hashed-token');
    });

    it('허용되지 않은 역할이면 예외를 던진다', async () => {
        const authSessionPort: AuthSessionPort = {
            findById: jest.fn(),
            updateRefreshToken: jest.fn(),
        };

        const authTokenPort: AuthTokenPort = {
            generateTokens: jest.fn(),
            verifyRefreshToken: jest.fn().mockReturnValue({
                sub: 'user-1',
                email: 'user@test.com',
                role: 'admin',
                type: 'refresh',
            }),
            hashRefreshToken: jest.fn(),
            generateReactivationToken: jest.fn(),
            verifyReactivationToken: jest.fn(),
            compareRefreshToken: jest.fn(),
        };

        const useCase = new RefreshAuthTokenUseCase(
            authSessionPort,
            authTokenPort,
            new AuthSessionAuthenticationService(),
        );

        await expect(useCase.execute('refresh-token-value')).rejects.toBeInstanceOf(DomainAuthenticationError);
    });
});
