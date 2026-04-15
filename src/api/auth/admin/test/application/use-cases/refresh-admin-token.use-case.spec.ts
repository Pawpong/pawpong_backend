import { DomainAuthenticationError } from '../../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';
import { AuthAdminAuthenticationService } from '../../../domain/services/auth-admin-authentication.service';
import { AuthAdminRefreshTokenResultMapperService } from '../../../domain/services/auth-admin-refresh-token-result-mapper.service';
import { AuthAdminReaderPort, AuthAdminSnapshot } from '../../../application/ports/auth-admin-reader.port';
import {
    AuthAdminIssuedTokenPayload,
    AuthAdminTokenPort,
    AuthAdminVerifiedTokenPayload,
} from '../../../application/ports/auth-admin-token.port';
import { RefreshAdminTokenUseCase } from '../../../application/use-cases/refresh-admin-token.use-case';

describe('관리자 token 재발급 유스케이스', () => {
    const adminSnapshot: AuthAdminSnapshot = {
        adminId: 'admin-1',
        email: 'admin@test.com',
        passwordHash: 'hashed-password',
        name: '관리자',
        adminLevel: 'super_admin',
        permissions: {
            canManageUsers: true,
            canManageBreeders: true,
            canManageReports: true,
            canViewStatistics: true,
            canManageAdmins: true,
        },
    };

    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    it('관리자 refresh 토큰에서 accessToken을 재발급한다', async () => {
        const reader: AuthAdminReaderPort = {
            findActiveByEmail: jest.fn().mockResolvedValue(adminSnapshot),
            updateLastLogin: jest.fn(),
        };
        const tokenPort: AuthAdminTokenPort = {
            createAccessToken: jest.fn().mockReturnValue('new-access-token'),
            createRefreshToken: jest.fn(),
            verifyRefreshToken: jest.fn().mockReturnValue({
                sub: 'admin-1',
                email: 'admin@test.com',
                role: 'admin',
                adminLevel: 'super_admin',
            } satisfies AuthAdminVerifiedTokenPayload),
        };
        const useCase = new RefreshAdminTokenUseCase(
            reader,
            tokenPort,
            new AuthAdminAuthenticationService(),
            new AuthAdminRefreshTokenResultMapperService(),
            logger,
        );

        await expect(useCase.execute('refresh-token')).resolves.toEqual({
            accessToken: 'new-access-token',
        });
        expect(tokenPort.createAccessToken).toHaveBeenCalledWith({
            sub: 'admin-1',
            email: 'admin@test.com',
            role: 'admin',
            adminLevel: 'super_admin',
        } satisfies AuthAdminIssuedTokenPayload);
    });

    it('잘못된 토큰은 도메인 인증 예외로 변환한다', async () => {
        const useCase = new RefreshAdminTokenUseCase(
            {
                findActiveByEmail: jest.fn(),
                updateLastLogin: jest.fn(),
            },
            {
                createAccessToken: jest.fn(),
                createRefreshToken: jest.fn(),
                verifyRefreshToken: jest.fn().mockImplementation(() => {
                    throw new Error('jwt malformed');
                }),
            },
            new AuthAdminAuthenticationService(),
            new AuthAdminRefreshTokenResultMapperService(),
            logger,
        );

        await expect(useCase.execute('bad-token')).rejects.toBeInstanceOf(DomainAuthenticationError);
    });

    it('관리자 역할이 아니면 도메인 인증 예외를 던진다', async () => {
        const useCase = new RefreshAdminTokenUseCase(
            {
                findActiveByEmail: jest.fn().mockResolvedValue(adminSnapshot),
                updateLastLogin: jest.fn(),
            },
            {
                createAccessToken: jest.fn(),
                createRefreshToken: jest.fn(),
                verifyRefreshToken: jest.fn().mockReturnValue({
                    sub: 'admin-1',
                    email: 'admin@test.com',
                    role: 'adopter',
                } satisfies AuthAdminVerifiedTokenPayload),
            },
            new AuthAdminAuthenticationService(),
            new AuthAdminRefreshTokenResultMapperService(),
            logger,
        );

        await expect(useCase.execute('bad-role-token')).rejects.toBeInstanceOf(DomainAuthenticationError);
    });

    it('예상하지 못한 조회 오류는 그대로 전파한다', async () => {
        const useCase = new RefreshAdminTokenUseCase(
            {
                findActiveByEmail: jest.fn().mockRejectedValue(new Error('db down')),
                updateLastLogin: jest.fn(),
            },
            {
                createAccessToken: jest.fn(),
                createRefreshToken: jest.fn(),
                verifyRefreshToken: jest.fn().mockReturnValue({
                    sub: 'admin-1',
                    email: 'admin@test.com',
                    role: 'admin',
                    adminLevel: 'super_admin',
                } satisfies AuthAdminVerifiedTokenPayload),
            },
            new AuthAdminAuthenticationService(),
            new AuthAdminRefreshTokenResultMapperService(),
            logger,
        );

        await expect(useCase.execute('refresh-token')).rejects.toThrow('db down');
    });
});
