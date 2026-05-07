import { BadRequestException } from '@nestjs/common';

import { RegisterAdopterV2UseCase } from '../../../application/use-cases/register-adopter-v2.use-case';
import { AuthV2TermsAgreementValidatorService } from '../../../domain/services/auth-v2-terms-agreement-validator.service';

const ACTIVE_TERMS = [
    {
        id: '1',
        code: 'service' as const,
        version: 'v1.0',
        title: '서비스 이용약관',
        body: '...',
        isRequired: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '2',
        code: 'privacy' as const,
        version: 'v1.0',
        title: '개인정보',
        body: '...',
        isRequired: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '3',
        code: 'marketing' as const,
        version: 'v1.0',
        title: '마케팅',
        body: '...',
        isRequired: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '4',
        code: 'counsel_privacy' as const,
        version: 'v1.0',
        title: '상담 개인정보',
        body: '...',
        isRequired: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

describe('v2 입양자 회원가입 유스케이스', () => {
    const authRegistrationPort = {
        findAdopterBySocialAuth: jest.fn(),
        findAdopterByNickname: jest.fn(),
        createAdopter: jest.fn(),
        saveAdopterRefreshToken: jest.fn(),
    };
    const authRegistrationNotificationPort = { notifyAdopterRegistered: jest.fn() };
    const authTokenPort = {
        generateTokens: jest.fn(),
        hashRefreshToken: jest.fn(),
    };
    const termsReaderPort = { readActiveAll: jest.fn() };
    const authSocialIdentityService = {
        parseRequiredTempId: jest.fn().mockReturnValue({ provider: 'kakao', providerId: '12345' }),
    };
    const authStoredFileNameService = { extract: jest.fn().mockReturnValue('') };
    const authPhoneNumberNormalizerService = { normalize: jest.fn((p) => p ?? '') };
    const authSignupResultMapperService = {
        toAdopterResult: jest.fn().mockReturnValue({ adopterId: 'adopter-1' }),
    };
    const authSignupValidationService = {
        assertAdopterSocialAccountAvailable: jest.fn(),
        ensureAdopterRegistrationInput: jest.fn(),
        assertAdopterNicknameAvailable: jest.fn(),
    };

    const useCase = new RegisterAdopterV2UseCase(
        authRegistrationPort as any,
        authRegistrationNotificationPort as any,
        authTokenPort as any,
        termsReaderPort as any,
        authSocialIdentityService as any,
        authStoredFileNameService as any,
        authPhoneNumberNormalizerService as any,
        authSignupResultMapperService as any,
        authSignupValidationService as any,
        new AuthV2TermsAgreementValidatorService(),
    );

    const baseCommand = {
        tempId: 'temp_kakao_12345_1',
        email: 'a@test.com',
        nickname: '펫러버',
        realName: '홍길동',
        termsAgreements: [
            { code: 'service', version: 'v1.0' },
            { code: 'privacy', version: 'v1.0' },
        ],
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        authRegistrationPort.findAdopterBySocialAuth.mockResolvedValue(null);
        authRegistrationPort.findAdopterByNickname.mockResolvedValue(null);
        authRegistrationPort.createAdopter.mockResolvedValue({
            _id: { toString: () => 'adopter-1' },
            emailAddress: 'a@test.com',
            nickname: '펫러버',
            phoneNumber: '',
        });
        authTokenPort.generateTokens.mockReturnValue({ accessToken: 'a', refreshToken: 'r' });
        authTokenPort.hashRefreshToken.mockResolvedValue('hashed');
        termsReaderPort.readActiveAll.mockResolvedValue(ACTIVE_TERMS);
    });

    it('필수 약관 누락 시 BadRequestException 으로 가입 실패', async () => {
        await expect(
            useCase.execute({
                ...baseCommand,
                termsAgreements: [{ code: 'service', version: 'v1.0' }],
            }),
        ).rejects.toThrow(BadRequestException);

        expect(authRegistrationPort.createAdopter).not.toHaveBeenCalled();
    });

    it('counsel_privacy 동의 없이 counselDefaultProfile 만 보내면 가입 실패', async () => {
        await expect(
            useCase.execute({
                ...baseCommand,
                counselDefaultProfile: {
                    selfIntroduction: '자기소개',
                    counselPrivacyAgreed: true,
                },
            }),
        ).rejects.toThrow(/counsel_privacy/);

        expect(authRegistrationPort.createAdopter).not.toHaveBeenCalled();
    });

    it('marketing 동의가 termsAgreements 에 없으면 marketingAgreed=false 로 저장 (클라 boolean spoof 차단)', async () => {
        await useCase.execute(baseCommand);

        const createdPayload = authRegistrationPort.createAdopter.mock.calls[0][0];
        expect(createdPayload.marketingAgreed).toBe(false);
    });

    it('marketing 코드를 termsAgreements 에 포함하면 marketingAgreed=true', async () => {
        await useCase.execute({
            ...baseCommand,
            termsAgreements: [
                ...baseCommand.termsAgreements,
                { code: 'marketing', version: 'v1.0' },
            ],
        });

        const createdPayload = authRegistrationPort.createAdopter.mock.calls[0][0];
        expect(createdPayload.marketingAgreed).toBe(true);
    });

    it('약관 버전이 활성 버전과 다르면 가입 실패', async () => {
        await expect(
            useCase.execute({
                ...baseCommand,
                termsAgreements: [
                    { code: 'service', version: 'v0.9' },
                    { code: 'privacy', version: 'v1.0' },
                ],
            }),
        ).rejects.toThrow(/버전이 일치하지 않습니다/);
    });
});
