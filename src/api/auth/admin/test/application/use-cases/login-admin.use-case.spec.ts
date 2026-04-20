import { UnauthorizedException } from '@nestjs/common';

import { DomainAuthenticationError } from '../../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';
import { AuthAdminAuthenticationService } from '../../../domain/services/auth-admin-authentication.service';
import { AuthAdminLoginResultMapperService } from '../../../domain/services/auth-admin-login-result-mapper.service';
import { AuthAdminPasswordPort } from '../../../application/ports/auth-admin-password.port';
import { AuthAdminReaderPort, AuthAdminSnapshot } from '../../../application/ports/auth-admin-reader.port';
import { AuthAdminTokenPort } from '../../../application/ports/auth-admin-token.port';
import { LoginAdminUseCase } from '../../../application/use-cases/login-admin.use-case';

describe('관리자 로그인 유스케이스', () => {
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

    it('관리자 로그인 응답 계약을 유지한다', async () => {
        const reader: AuthAdminReaderPort = {
            findActiveByEmail: jest.fn().mockResolvedValue(adminSnapshot),
            updateLastLogin: jest.fn().mockResolvedValue(undefined),
        };
        const passwordPort: AuthAdminPasswordPort = {
            compare: jest.fn().mockResolvedValue(true),
        };
        const tokenPort: AuthAdminTokenPort = {
            createAccessToken: jest.fn().mockReturnValue('access-token'),
            createRefreshToken: jest.fn().mockReturnValue('refresh-token'),
            verifyRefreshToken: jest.fn(),
        };
        const useCase = new LoginAdminUseCase(
            reader,
            passwordPort,
            tokenPort,
            new AuthAdminAuthenticationService(),
            new AuthAdminLoginResultMapperService(),
            logger,
        );

        await expect(useCase.execute('admin@test.com', 'password')).resolves.toEqual({
            adminId: 'admin-1',
            email: 'admin@test.com',
            name: '관리자',
            adminLevel: 'super_admin',
            permissions: adminSnapshot.permissions,
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
        });
        expect(reader.updateLastLogin).toHaveBeenCalledWith('admin-1');
    });

    it('존재하지 않는 관리자는 도메인 인증 예외를 던진다', async () => {
        const useCase = new LoginAdminUseCase(
            {
                findActiveByEmail: jest.fn().mockResolvedValue(null),
                updateLastLogin: jest.fn(),
            },
            {
                compare: jest.fn(),
            },
            {
                createAccessToken: jest.fn(),
                createRefreshToken: jest.fn(),
                verifyRefreshToken: jest.fn(),
            },
            new AuthAdminAuthenticationService(),
            new AuthAdminLoginResultMapperService(),
            logger,
        );

        await expect(useCase.execute('missing@test.com', 'password')).rejects.toBeInstanceOf(
            DomainAuthenticationError,
        );
    });

    it('비밀번호가 틀리면 도메인 인증 예외를 던진다', async () => {
        const useCase = new LoginAdminUseCase(
            {
                findActiveByEmail: jest.fn().mockResolvedValue(adminSnapshot),
                updateLastLogin: jest.fn(),
            },
            {
                compare: jest.fn().mockResolvedValue(false),
            },
            {
                createAccessToken: jest.fn(),
                createRefreshToken: jest.fn(),
                verifyRefreshToken: jest.fn(),
            },
            new AuthAdminAuthenticationService(),
            new AuthAdminLoginResultMapperService(),
            logger,
        );

        await expect(useCase.execute('admin@test.com', 'wrong')).rejects.toBeInstanceOf(
            DomainAuthenticationError,
        );
    });
});
