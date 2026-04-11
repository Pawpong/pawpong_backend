import { BadRequestException, ConflictException } from '@nestjs/common';

import { CompleteLegacySocialRegistrationUseCase } from '../../../application/use-cases/complete-legacy-social-registration.use-case';

describe('레거시 소셜 가입 완료 유스케이스', () => {
    const authRegistrationPort = {
        findAdopterByEmail: jest.fn(),
        findAdopterByNickname: jest.fn(),
        findAdopterBySocialAuth: jest.fn(),
        createAdopter: jest.fn(),
        saveAdopterRefreshToken: jest.fn(),
        findBreederByEmail: jest.fn(),
        findBreederByName: jest.fn(),
        findBreederBySocialAuth: jest.fn(),
        createBreeder: jest.fn(),
        saveBreederRefreshToken: jest.fn(),
    };
    const authTokenService = {
        generateTokens: jest.fn(),
        hashRefreshToken: jest.fn(),
    };

    const useCase = new CompleteLegacySocialRegistrationUseCase(
        authRegistrationPort as any,
        authTokenService as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
        authTokenService.generateTokens.mockReturnValue({
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            accessTokenExpiresIn: 3600,
            refreshTokenExpiresIn: 604800,
        });
        authTokenService.hashRefreshToken.mockResolvedValue('hashed-refresh-token');
    });

    it('입양자 소셜 완료를 토큰 응답으로 반환한다', async () => {
        authRegistrationPort.findAdopterByNickname.mockResolvedValue(null);
        authRegistrationPort.createAdopter.mockResolvedValue({
            _id: { toString: () => 'adopter-1' },
            emailAddress: 'adopter@test.com',
            nickname: '입양자',
            accountStatus: 'active',
            profileImageFileName: 'profile.jpg',
        });

        const result = await useCase.execute(
            {
                provider: 'google',
                providerId: 'provider-user-1',
                email: 'adopter@test.com',
                name: '입양자',
                profileImage: 'profile.jpg',
            },
            {
                role: 'adopter',
                nickname: '입양자',
                phone: '010-1234-5678',
            },
        );

        expect(authRegistrationPort.saveAdopterRefreshToken).toHaveBeenCalledWith(
            'adopter-1',
            'hashed-refresh-token',
        );
        expect(result).toMatchObject({
            accessToken: 'access-token',
            message: '소셜 회원가입이 완료되었습니다.',
            userInfo: {
                userId: 'adopter-1',
                nickname: '입양자',
                userRole: 'adopter',
            },
        });
    });

    it('중복 닉네임이면 예외를 던진다', async () => {
        authRegistrationPort.findAdopterByNickname.mockResolvedValue({ _id: 'existing' });

        await expect(
            useCase.execute(
                {
                    provider: 'google',
                    providerId: 'provider-user-1',
                    email: 'adopter@test.com',
                    name: '입양자',
                },
                {
                    role: 'adopter',
                    nickname: '입양자',
                },
            ),
        ).rejects.toThrow(new ConflictException('Nickname already exists'));
    });

    it('브리더 레거시 소셜 완료는 district를 city에 저장하는 기존 규칙을 유지한다', async () => {
        authRegistrationPort.createBreeder.mockResolvedValue({
            _id: { toString: () => 'breeder-1' },
            emailAddress: 'breeder@test.com',
            name: '행복브리더',
            accountStatus: 'active',
            profileImageFileName: 'profile.jpg',
        });

        const result = await useCase.execute(
            {
                provider: 'kakao',
                providerId: 'provider-user-2',
                email: 'breeder@test.com',
                name: '행복브리더',
                profileImage: 'profile.jpg',
            },
            {
                role: 'breeder',
                breederName: '행복브리더',
                district: '강남구',
                petType: 'dog',
                breeds: ['포메라니안'],
                plan: 'pro',
                level: 'elite',
            },
        );

        expect(authRegistrationPort.createBreeder).toHaveBeenCalledWith(
            expect.objectContaining({
                profile: expect.objectContaining({
                    location: {
                        city: '강남구',
                        district: '',
                    },
                }),
                verification: expect.objectContaining({
                    plan: 'pro',
                    level: 'elite',
                }),
            }),
        );
        expect(result).toMatchObject({
            message: '소셜 회원가입이 완료되었습니다.',
            userInfo: {
                userId: 'breeder-1',
                nickname: '행복브리더',
                userRole: 'breeder',
            },
        });
    });

    it('브리더명이나 지역이 없으면 예외를 던진다', async () => {
        await expect(
            useCase.execute(
                {
                    provider: 'kakao',
                    providerId: 'provider-user-2',
                    email: 'breeder@test.com',
                    name: '행복브리더',
                },
                {
                    role: 'breeder',
                    breeds: ['포메라니안'],
                },
            ),
        ).rejects.toThrow(new BadRequestException('브리더는 브리더명, 지역이 필요합니다.'));
    });
});
