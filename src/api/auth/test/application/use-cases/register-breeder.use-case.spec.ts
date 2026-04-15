import { BadRequestException, ConflictException } from '@nestjs/common';

import { RegisterBreederUseCase } from '../../../application/use-cases/register-breeder.use-case';
import { AuthSocialIdentityService } from '../../../domain/services/auth-social-identity.service';
import { AuthBreederDocumentTypeService } from '../../../domain/services/auth-breeder-document-type.service';
import { AuthPhoneNumberNormalizerService } from '../../../domain/services/auth-phone-number-normalizer.service';
import { AuthSignupResultMapperService } from '../../../domain/services/auth-signup-result-mapper.service';

describe('브리더 회원가입 유스케이스', () => {
    const authRegistrationPort = {
        findBreederByEmail: jest.fn(),
        findAdopterByEmail: jest.fn(),
        createBreeder: jest.fn(),
        saveBreederRefreshToken: jest.fn(),
    };
    const authRegistrationNotificationPort = {
        notifyBreederRegistered: jest.fn(),
        notifyBreederDocumentsSubmitted: jest.fn(),
    };
    const authTempUploadPort = {
        get: jest.fn().mockReturnValue(undefined),
        delete: jest.fn(),
    };
    const authTokenPort = {
        generateTokens: jest.fn(),
        hashRefreshToken: jest.fn(),
    };

    const mockStoredFileNameService = {
        extract: jest.fn().mockReturnValue(undefined),
    };

    const useCase = new RegisterBreederUseCase(
        authRegistrationPort as any,
        authRegistrationNotificationPort as any,
        authTempUploadPort as any,
        authTokenPort as any,
        new AuthSocialIdentityService(),
        mockStoredFileNameService as any,
        new AuthBreederDocumentTypeService(),
        new AuthPhoneNumberNormalizerService(),
        new AuthSignupResultMapperService(),
    );

    const baseDto = {
        email: 'breeder@test.com',
        breederName: '행복브리더',
        phoneNumber: '01099998888',
        agreements: { termsOfService: true, privacyPolicy: true },
        animal: 'dog',
        breeds: ['말티즈'],
        breederLocation: { city: '서울', district: '강남구' },
        plan: 'basic',
        level: 'new',
        documentUrls: [],
        documentTypes: [],
    };

    const mockSavedBreeder = {
        _id: { toString: () => 'breeder-1' },
        emailAddress: 'breeder@test.com',
        name: '행복브리더',
        nickname: '행복브리더',
        phoneNumber: '01099998888',
        profileImageFileName: '',
        petType: 'dog',
        breeds: ['말티즈'],
        verification: { plan: 'basic', level: 'new', status: 'pending' },
        profile: { location: { city: '서울', district: '강남구' }, specialization: ['dog'] },
        accountStatus: 'active',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 브리더를 등록한다', async () => {
        authRegistrationPort.findBreederByEmail.mockResolvedValue(null);
        authRegistrationPort.findAdopterByEmail.mockResolvedValue(null);
        authRegistrationPort.createBreeder.mockResolvedValue(mockSavedBreeder);
        authRegistrationPort.saveBreederRefreshToken.mockResolvedValue(undefined);
        authTokenPort.generateTokens.mockReturnValue({ accessToken: 'access-token', refreshToken: 'refresh-token' });
        authTokenPort.hashRefreshToken.mockResolvedValue('hashed-refresh-token');
        authRegistrationNotificationPort.notifyBreederRegistered.mockResolvedValue(undefined);
        authRegistrationNotificationPort.notifyBreederDocumentsSubmitted.mockResolvedValue(undefined);

        const result = await useCase.execute(baseDto as any);

        expect(result.breederId).toBe('breeder-1');
        expect(result.email).toBe('breeder@test.com');
        expect(result.accessToken).toBe('access-token');
    });

    it('필수 약관 미동의 시 BadRequestException을 던진다', async () => {
        await expect(
            useCase.execute({ ...baseDto, agreements: { termsOfService: false, privacyPolicy: true } } as any),
        ).rejects.toThrow(BadRequestException);
        await expect(
            useCase.execute({ ...baseDto, agreements: { termsOfService: false, privacyPolicy: true } } as any),
        ).rejects.toThrow('필수 약관에 동의해야 합니다.');
    });

    it('이미 가입된 브리더 이메일이면 ConflictException을 던진다', async () => {
        authRegistrationPort.findBreederByEmail.mockResolvedValue({ emailAddress: 'breeder@test.com' });

        await expect(useCase.execute(baseDto as any)).rejects.toThrow(ConflictException);
        await expect(useCase.execute(baseDto as any)).rejects.toThrow('이미 가입된 이메일입니다.');
    });

    it('이미 가입된 입양자 이메일이면 ConflictException을 던진다', async () => {
        authRegistrationPort.findBreederByEmail.mockResolvedValue(null);
        authRegistrationPort.findAdopterByEmail.mockResolvedValue({ emailAddress: 'breeder@test.com' });

        await expect(useCase.execute(baseDto as any)).rejects.toThrow(ConflictException);
        await expect(useCase.execute(baseDto as any)).rejects.toThrow(
            '해당 이메일로 입양자 계정이 이미 존재합니다.',
        );
    });
});
