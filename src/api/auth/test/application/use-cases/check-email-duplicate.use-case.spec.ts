import { CheckEmailDuplicateUseCase } from '../../../application/use-cases/check-email-duplicate.use-case';

describe('이메일 중복 확인 유스케이스', () => {
    const authRegistrationPort = {
        findAdopterByEmail: jest.fn(),
        findBreederByEmail: jest.fn(),
    };

    const useCase = new CheckEmailDuplicateUseCase(authRegistrationPort as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('입양자 테이블에 이메일이 존재하면 true를 반환한다', async () => {
        authRegistrationPort.findAdopterByEmail.mockResolvedValue({ emailAddress: 'test@test.com' });

        const result = await useCase.execute('test@test.com');

        expect(result).toBe(true);
        expect(authRegistrationPort.findBreederByEmail).not.toHaveBeenCalled();
    });

    it('브리더 테이블에 이메일이 존재하면 true를 반환한다', async () => {
        authRegistrationPort.findAdopterByEmail.mockResolvedValue(null);
        authRegistrationPort.findBreederByEmail.mockResolvedValue({ emailAddress: 'breeder@test.com' });

        const result = await useCase.execute('breeder@test.com');

        expect(result).toBe(true);
    });

    it('어느 테이블에도 이메일이 없으면 false를 반환한다', async () => {
        authRegistrationPort.findAdopterByEmail.mockResolvedValue(null);
        authRegistrationPort.findBreederByEmail.mockResolvedValue(null);

        const result = await useCase.execute('new@test.com');

        expect(result).toBe(false);
    });

    it('입양자 테이블에서 찾으면 브리더 테이블은 조회하지 않는다', async () => {
        authRegistrationPort.findAdopterByEmail.mockResolvedValue({ emailAddress: 'test@test.com' });

        await useCase.execute('test@test.com');

        expect(authRegistrationPort.findBreederByEmail).not.toHaveBeenCalled();
    });
});
