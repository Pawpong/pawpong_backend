import { DomainConflictError, DomainValidationError } from '../../../../../common/error/domain.error';
import { RegisterAdopterUseCase } from '../../../application/use-cases/register-adopter.use-case';
import { AuthSocialIdentityService } from '../../../domain/services/auth-social-identity.service';
import { AuthPhoneNumberNormalizerService } from '../../../domain/services/auth-phone-number-normalizer.service';
import { AuthSignupResultMapperService } from '../../../domain/services/auth-signup-result-mapper.service';
import { AuthSignupValidationService } from '../../../domain/services/auth-signup-validation.service';

describe('입양자 회원가입 유스케이스', () => {
    const authRegistrationPort = {
        findAdopterBySocialAuth: jest.fn(),
        findAdopterByNickname: jest.fn(),
        createAdopter: jest.fn(),
        saveAdopterRefreshToken: jest.fn(),
    };
    const authRegistrationNotificationPort = {
        notifyAdopterRegistered: jest.fn(),
    };
    const authTokenPort = {
        generateTokens: jest.fn(),
        hashRefreshToken: jest.fn(),
    };
    const mockStoredFileNameService = {
        extract: jest.fn().mockReturnValue(undefined),
    };

    const useCase = new RegisterAdopterUseCase(
        authRegistrationPort as any,
        authRegistrationNotificationPort as any,
        authTokenPort as any,
        new AuthSocialIdentityService(),
        mockStoredFileNameService as any,
        new AuthPhoneNumberNormalizerService(),
        new AuthSignupResultMapperService(),
        new AuthSignupValidationService(),
    );

    const validTempId = 'temp_google_google-uid-123_ts';
    const baseDto = {
        tempId: validTempId,
        email: 'new@test.com',
        nickname: '새입양자',
        phone: '01012345678',
        profileImage: undefined,
        marketingAgreed: false,
    };

    const mockSavedAdopter = {
        _id: { toString: () => 'adopter-1' },
        emailAddress: 'new@test.com',
        nickname: '새입양자',
        phoneNumber: '01012345678',
        profileImageFileName: '',
        accountStatus: 'active',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockStoredFileNameService.extract.mockReturnValue(undefined);
    });

    it('정상적으로 입양자를 등록한다', async () => {
        authRegistrationPort.findAdopterBySocialAuth.mockResolvedValue(null);
        authRegistrationPort.findAdopterByNickname.mockResolvedValue(null);
        authRegistrationPort.createAdopter.mockResolvedValue(mockSavedAdopter);
        authRegistrationPort.saveAdopterRefreshToken.mockResolvedValue(undefined);
        authTokenPort.generateTokens.mockReturnValue({ accessToken: 'access-token', refreshToken: 'refresh-token' });
        authTokenPort.hashRefreshToken.mockResolvedValue('hashed-refresh-token');
        authRegistrationNotificationPort.notifyAdopterRegistered.mockResolvedValue(undefined);

        const result = await useCase.execute(baseDto as any);

        expect(result.adopterId).toBe('adopter-1');
        expect(result.email).toBe('new@test.com');
        expect(result.accessToken).toBe('access-token');
    });

    it('유효하지 않은 tempId 형식이면 도메인 검증 예외를 던진다', async () => {
        await expect(
            useCase.execute({ ...baseDto, tempId: 'invalid-format' } as any),
        ).rejects.toThrow(DomainValidationError);
        await expect(
            useCase.execute({ ...baseDto, tempId: 'invalid-format' } as any),
        ).rejects.toThrow('유효하지 않은 임시 ID 형식입니다.');
    });

    it('이미 가입된 소셜 계정이면 도메인 충돌 예외를 던진다', async () => {
        authRegistrationPort.findAdopterBySocialAuth.mockResolvedValue({ _id: 'existing-adopter' });

        await expect(useCase.execute(baseDto as any)).rejects.toThrow(DomainConflictError);
        await expect(useCase.execute(baseDto as any)).rejects.toThrow('이미 입양자로 가입된 소셜 계정입니다.');
    });

    it('이메일이 없으면 도메인 검증 예외를 던진다', async () => {
        authRegistrationPort.findAdopterBySocialAuth.mockResolvedValue(null);

        await expect(
            useCase.execute({ ...baseDto, email: undefined } as any),
        ).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute({ ...baseDto, email: undefined } as any)).rejects.toThrow('이메일 정보가 필요합니다.');
    });

    it('닉네임이 없으면 도메인 검증 예외를 던진다', async () => {
        authRegistrationPort.findAdopterBySocialAuth.mockResolvedValue(null);

        await expect(
            useCase.execute({ ...baseDto, nickname: undefined } as any),
        ).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute({ ...baseDto, nickname: undefined } as any)).rejects.toThrow('닉네임이 필요합니다.');
    });

    it('닉네임이 이미 사용 중이면 도메인 충돌 예외를 던진다', async () => {
        authRegistrationPort.findAdopterBySocialAuth.mockResolvedValue(null);
        authRegistrationPort.findAdopterByNickname.mockResolvedValue({ nickname: '새입양자' });

        await expect(useCase.execute(baseDto as any)).rejects.toThrow(DomainConflictError);
        await expect(useCase.execute(baseDto as any)).rejects.toThrow('이미 사용 중인 닉네임입니다.');
    });
});
