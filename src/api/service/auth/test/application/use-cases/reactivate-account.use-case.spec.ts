import { DomainAuthenticationError, DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { ReactivateAccountUseCase } from '../../../application/use-cases/reactivate-account.use-case';
import { AuthAccountReactivationPolicyService } from '../../../domain/services/auth-account-reactivation-policy.service';

describe('탈퇴 계정 복구 유스케이스', () => {
    const deletedAdopter = {
        userId: 'adopter-id',
        email: 'deleted@test.com',
        name: '탈퇴유저',
        role: 'adopter' as const,
        accountStatus: 'deleted',
        profileImage: undefined,
    };

    const createUseCase = () => {
        const authTokenPort = {
            verifyReactivationToken: jest.fn().mockReturnValue({
                sub: 'adopter-id',
                role: 'adopter',
                type: 'reactivation',
            }),
        };
        const authAccountReactivationPort = {
            findById: jest.fn().mockResolvedValue(deletedAdopter),
            reactivate: jest.fn().mockResolvedValue(undefined),
        };
        const authSocialCallbackPort = {
            generateSocialLoginTokens: jest.fn().mockResolvedValue({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                accessTokenExpiresIn: 3600,
                refreshTokenExpiresIn: 604800,
                userInfo: {
                    userId: 'adopter-id',
                    email: 'deleted@test.com',
                    name: '탈퇴유저',
                    profileImage: undefined,
                },
            }),
        };

        const useCase = new ReactivateAccountUseCase(
            authTokenPort as never,
            authAccountReactivationPort,
            authSocialCallbackPort as never,
            new AuthAccountReactivationPolicyService(),
        );

        return { useCase, authTokenPort, authAccountReactivationPort, authSocialCallbackPort };
    };

    it('탈퇴 계정을 복구하고 로그인 토큰을 발급한다', async () => {
        const { useCase, authAccountReactivationPort, authSocialCallbackPort } = createUseCase();

        await expect(useCase.execute('reactivation-token')).resolves.toEqual({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            accessTokenExpiresIn: 3600,
            refreshTokenExpiresIn: 604800,
            role: 'adopter',
            userInfo: {
                userId: 'adopter-id',
                email: 'deleted@test.com',
                name: '탈퇴유저',
                profileImage: undefined,
            },
        });

        expect(authAccountReactivationPort.reactivate).toHaveBeenCalledWith('adopter-id', 'adopter');
        expect(authSocialCallbackPort.generateSocialLoginTokens).toHaveBeenCalledWith({
            userId: 'adopter-id',
            email: 'deleted@test.com',
            name: '탈퇴유저',
            role: 'adopter',
            profileImage: undefined,
        });
    });

    it('계정이 없으면 DomainNotFoundError를 던진다', async () => {
        const { useCase, authAccountReactivationPort } = createUseCase();
        authAccountReactivationPort.findById.mockResolvedValue(null);

        await expect(useCase.execute('reactivation-token')).rejects.toThrow(DomainNotFoundError);
        expect(authAccountReactivationPort.reactivate).not.toHaveBeenCalled();
    });

    it('탈퇴 상태가 아닌 계정은 복구하지 않는다', async () => {
        const { useCase, authAccountReactivationPort } = createUseCase();
        authAccountReactivationPort.findById.mockResolvedValue({ ...deletedAdopter, accountStatus: 'active' });

        await expect(useCase.execute('reactivation-token')).rejects.toThrow(DomainAuthenticationError);
        expect(authAccountReactivationPort.reactivate).not.toHaveBeenCalled();
    });

    it('정지된 계정은 복구하지 않는다', async () => {
        const { useCase, authAccountReactivationPort } = createUseCase();
        authAccountReactivationPort.findById.mockResolvedValue({ ...deletedAdopter, accountStatus: 'suspended' });

        await expect(useCase.execute('reactivation-token')).rejects.toThrow(DomainAuthenticationError);
        expect(authAccountReactivationPort.reactivate).not.toHaveBeenCalled();
    });

    it('만료된 복구 토큰은 재로그인을 안내한다', async () => {
        const { useCase, authTokenPort, authAccountReactivationPort } = createUseCase();
        authTokenPort.verifyReactivationToken.mockImplementation(() => {
            const error = new Error('jwt expired');
            error.name = 'TokenExpiredError';
            throw error;
        });

        await expect(useCase.execute('expired-token')).rejects.toThrow(
            new DomainAuthenticationError('복구 요청이 만료되었습니다. 다시 로그인해주세요.'),
        );
        expect(authAccountReactivationPort.findById).not.toHaveBeenCalled();
    });

    it('위조된 복구 토큰은 인증 예외를 던진다', async () => {
        const { useCase, authTokenPort } = createUseCase();
        authTokenPort.verifyReactivationToken.mockImplementation(() => {
            const error = new Error('invalid signature');
            error.name = 'JsonWebTokenError';
            throw error;
        });

        await expect(useCase.execute('tampered-token')).rejects.toThrow(
            new DomainAuthenticationError('유효하지 않은 복구 토큰입니다.'),
        );
    });
});
