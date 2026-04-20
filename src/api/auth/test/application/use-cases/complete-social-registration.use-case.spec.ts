import { DomainValidationError } from '../../../../../common/error/domain.error';
import { CompleteSocialRegistrationUseCase } from '../../../application/use-cases/complete-social-registration.use-case';
import { AuthSignupValidationService } from '../../../domain/services/auth-signup-validation.service';

describe('소셜 가입 완료 유스케이스', () => {
    const registerAdopter = {
        execute: jest.fn(),
    };
    const registerBreeder = {
        execute: jest.fn(),
    };
    const useCase = new CompleteSocialRegistrationUseCase(
        registerAdopter as any,
        registerBreeder as any,
        new AuthSignupValidationService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('입양자 소셜 회원가입은 입양자 포트로 위임한다', async () => {
        registerAdopter.execute.mockResolvedValue({ userId: 'adopter-1' });

        await expect(
            useCase.execute({
                tempId: 'temp',
                email: 'adopter@test.com',
                name: '입양자',
                role: 'adopter',
                nickname: '펫러버',
                phone: '01012345678',
            } as any),
        ).resolves.toEqual({ userId: 'adopter-1' });

        expect(registerAdopter.execute).toHaveBeenCalledWith({
            tempId: 'temp',
            email: 'adopter@test.com',
            nickname: '펫러버',
            phone: '01012345678',
            marketingAgreed: undefined,
        });
    });

    it('브리더 필수 값이 없으면 예외를 던진다', async () => {
        await expect(
            useCase.execute({
                tempId: 'temp',
                email: 'breeder@test.com',
                name: '브리더',
                role: 'breeder',
            } as any),
        ).rejects.toThrow(new DomainValidationError('브리더 회원가입 시 전화번호는 필수입니다.'));
    });
});
