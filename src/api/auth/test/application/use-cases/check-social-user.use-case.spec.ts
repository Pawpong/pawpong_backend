import { CheckSocialUserUseCase } from '../../../application/use-cases/check-social-user.use-case';
import { AuthSocialUserCheckResultMapperService } from '../../../domain/services/auth-social-user-check-result-mapper.service';

describe('소셜 사용자 확인 유스케이스', () => {
    const authRegistrationPort = {
        findAdopterBySocialAuth: jest.fn(),
        findBreederBySocialAuth: jest.fn(),
    };

    const useCase = new CheckSocialUserUseCase(
        authRegistrationPort as any,
        new AuthSocialUserCheckResultMapperService(),
    );

    const mockAdopter = {
        _id: { toString: () => 'adopter-1' },
        emailAddress: 'adopter@test.com',
        nickname: '입양자1',
        profileImageFileName: 'profile.jpg',
    };

    const mockBreeder = {
        _id: { toString: () => 'breeder-1' },
        emailAddress: 'breeder@test.com',
        name: '행복브리더',
        nickname: undefined,
        profileImageFileName: undefined,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('입양자로 등록된 소셜 계정이면 입양자 결과를 반환한다', async () => {
        authRegistrationPort.findAdopterBySocialAuth.mockResolvedValue(mockAdopter);

        const result = await useCase.execute('google', 'google-id-123');

        expect(result.exists).toBe(true);
        if (result.exists) {
            expect(result.userRole).toBe('adopter');
            expect(result.userId).toBe('adopter-1');
            expect(result.email).toBe('adopter@test.com');
        }
        expect(authRegistrationPort.findBreederBySocialAuth).not.toHaveBeenCalled();
    });

    it('브리더로 등록된 소셜 계정이면 브리더 결과를 반환한다', async () => {
        authRegistrationPort.findAdopterBySocialAuth.mockResolvedValue(null);
        authRegistrationPort.findBreederBySocialAuth.mockResolvedValue(mockBreeder);

        const result = await useCase.execute('kakao', 'kakao-id-456');

        expect(result.exists).toBe(true);
        if (result.exists) {
            expect(result.userRole).toBe('breeder');
            expect(result.userId).toBe('breeder-1');
            expect(result.nickname).toBe('행복브리더');
        }
    });

    it('등록되지 않은 소셜 계정이면 exists: false를 반환한다', async () => {
        authRegistrationPort.findAdopterBySocialAuth.mockResolvedValue(null);
        authRegistrationPort.findBreederBySocialAuth.mockResolvedValue(null);

        const result = await useCase.execute('naver', 'naver-id-789');

        expect(result.exists).toBe(false);
    });

    it('provider와 providerId를 정확히 포트에 전달한다', async () => {
        authRegistrationPort.findAdopterBySocialAuth.mockResolvedValue(null);
        authRegistrationPort.findBreederBySocialAuth.mockResolvedValue(null);

        await useCase.execute('google', 'my-google-id');

        expect(authRegistrationPort.findAdopterBySocialAuth).toHaveBeenCalledWith('google', 'my-google-id');
        expect(authRegistrationPort.findBreederBySocialAuth).toHaveBeenCalledWith('google', 'my-google-id');
    });
});
