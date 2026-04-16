import { DomainAuthenticationError } from '../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { AuthSocialLoginPolicyService } from '../../domain/services/auth-social-login-policy.service';
import { AuthSocialCallbackAdapter } from '../../infrastructure/auth-social-callback.adapter';

describe('AuthSocialCallbackAdapter', () => {
    const profile = {
        provider: 'kakao',
        providerId: 'provider-id',
        email: 'user@test.com',
        name: '테스트 유저',
    };

    const createAdapter = () => {
        const authAdopterRepository = {
            findBySocialAuth: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
        };
        const authBreederRepository = {
            findBySocialAuth: jest.fn(),
            update: jest.fn(),
        };
        const configService = {
            get: jest.fn(),
        };
        const logger = {
            log: jest.fn(),
        } as unknown as CustomLoggerService;
        const authTokenPort = {
            generateTokens: jest.fn(),
            hashRefreshToken: jest.fn(),
        };

        const adapter = new AuthSocialCallbackAdapter(
            authAdopterRepository as never,
            authBreederRepository as never,
            configService as never,
            logger,
            authTokenPort as never,
            new AuthSocialLoginPolicyService(),
        );

        return {
            adapter,
            authAdopterRepository,
            authBreederRepository,
            configService,
            authTokenPort,
        };
    };

    it('탈퇴한 adopter는 DomainAuthenticationError를 던진다', async () => {
        const { adapter, authAdopterRepository } = createAdapter();
        authAdopterRepository.findBySocialAuth.mockResolvedValue({
            _id: { toString: () => 'adopter-id' },
            emailAddress: 'deleted@test.com',
            nickname: '탈퇴유저',
            accountStatus: 'deleted',
            profileImageFileName: null,
        });

        await expect(adapter.handleSocialLogin(profile)).rejects.toThrow(
            new DomainAuthenticationError('탈퇴한 계정으로는 로그인할 수 없습니다.'),
        );
    });

    it('정지된 breeder는 DomainAuthenticationError를 던진다', async () => {
        const { adapter, authAdopterRepository, authBreederRepository } = createAdapter();
        authAdopterRepository.findBySocialAuth.mockResolvedValue(null);
        authAdopterRepository.findByEmail.mockResolvedValue(null);
        authBreederRepository.findBySocialAuth.mockResolvedValue({
            _id: { toString: () => 'breeder-id' },
            emailAddress: 'suspended@test.com',
            name: '정지 브리더',
            nickname: '정지',
            accountStatus: 'suspended',
            profileImageFileName: null,
        });

        await expect(adapter.handleSocialLogin(profile)).rejects.toThrow(
            new DomainAuthenticationError('정지된 계정입니다. 자세한 내용은 이메일을 확인해주세요.'),
        );
    });

    it('소셜 로그인 토큰 발급 시 adopter refreshToken을 갱신한다', async () => {
        const { adapter, authAdopterRepository, authTokenPort } = createAdapter();
        authTokenPort.generateTokens.mockReturnValue({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            accessTokenExpiresIn: 3600,
            refreshTokenExpiresIn: 604800,
        });
        authTokenPort.hashRefreshToken.mockResolvedValue('hashed-refresh-token');
        authAdopterRepository.update.mockResolvedValue({ _id: 'adopter-id' });

        await expect(
            adapter.generateSocialLoginTokens({
                userId: 'adopter-id',
                email: 'adopter@test.com',
                name: '입양자',
                role: 'adopter',
            }),
        ).resolves.toEqual({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            accessTokenExpiresIn: 3600,
            refreshTokenExpiresIn: 604800,
            userInfo: {
                userId: 'adopter-id',
                email: 'adopter@test.com',
                name: '입양자',
                profileImage: undefined,
            },
        });

        expect(authAdopterRepository.update).toHaveBeenCalledWith('adopter-id', {
            refreshToken: 'hashed-refresh-token',
            lastActivityAt: expect.any(Date),
        });
    });
});
