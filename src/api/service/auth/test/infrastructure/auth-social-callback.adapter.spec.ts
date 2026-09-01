import { DomainAuthenticationError } from '../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AuthSocialLoginPolicyService } from '../../domain/services/auth-social-login-policy.service';
import { AuthSocialCallbackAdapter } from '../../infrastructure/auth-social-callback.adapter';

describe('AuthSocialCallbackAdapter', () => {
    type AccountUpdate = {
        refreshToken?: string;
        lastActivityAt?: Date;
        lastLoginAt?: Date;
    };

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
            update: jest.fn<Promise<unknown>, [string, AccountUpdate]>(),
        };
        const authBreederRepository = {
            findBySocialAuth: jest.fn(),
            update: jest.fn<Promise<unknown>, [string, AccountUpdate]>(),
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

    describe('resolveFrontendUrl', () => {
        it('OAuth state의 허용된 dev origin을 복원한다', () => {
            const { adapter, configService } = createAdapter();
            configService.get.mockImplementation((key: string) => {
                if (key === 'NODE_ENV') return 'development';
                if (key === 'FRONTEND_URL_LOCAL') return 'http://localhost:3000';
                return undefined;
            });

            expect(adapter.resolveFrontendUrl('https://dev.pawpong.kr/login|/community')).toBe(
                'https://dev.pawpong.kr',
            );
        });

        it('OAuth state의 허용된 localhost origin을 복원한다', () => {
            const { adapter, configService } = createAdapter();
            configService.get.mockImplementation((key: string) => {
                if (key === 'NODE_ENV') return 'development';
                if (key === 'FRONTEND_URL_LOCAL') return 'http://localhost:3000';
                return undefined;
            });

            expect(adapter.resolveFrontendUrl('http://localhost:3000/login|/community')).toBe('http://localhost:3000');
        });

        it('허용 origin 문자열을 쿼리에 숨긴 외부 URL은 환경 기본값으로 치환한다', () => {
            const { adapter, configService } = createAdapter();
            configService.get.mockImplementation((key: string) => {
                if (key === 'NODE_ENV') return 'production';
                if (key === 'FRONTEND_URL_PROD') return 'https://pawpong.kr';
                return undefined;
            });

            expect(adapter.resolveFrontendUrl('https://evil.example/?next=http://localhost:3000')).toBe(
                'https://pawpong.kr',
            );
        });

        it('유사 도메인은 허용하지 않는다', () => {
            const { adapter, configService } = createAdapter();
            configService.get.mockImplementation((key: string) => {
                if (key === 'NODE_ENV') return 'production';
                if (key === 'FRONTEND_URL_PROD') return 'https://pawpong.kr';
                return undefined;
            });

            expect(adapter.resolveFrontendUrl('https://dev.pawpong.kr.evil.example')).toBe('https://pawpong.kr');
        });
    });

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

        const [updatedUserId, updatePayload] = authAdopterRepository.update.mock.calls[0];
        expect(updatedUserId).toBe('adopter-id');
        expect(updatePayload.refreshToken).toBe('hashed-refresh-token');
        expect(updatePayload.lastActivityAt).toBeInstanceOf(Date);
    });
});
