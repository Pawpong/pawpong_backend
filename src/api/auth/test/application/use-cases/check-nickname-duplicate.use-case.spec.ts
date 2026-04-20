import { CheckNicknameDuplicateUseCase } from '../../../application/use-cases/check-nickname-duplicate.use-case';

describe('닉네임 중복 확인 유스케이스', () => {
    const authRegistrationPort = {
        findAdopterByNickname: jest.fn(),
    };

    const useCase = new CheckNicknameDuplicateUseCase(authRegistrationPort as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('닉네임이 이미 존재하면 true를 반환한다', async () => {
        authRegistrationPort.findAdopterByNickname.mockResolvedValue({ nickname: '행복입양자' });

        const result = await useCase.execute('행복입양자');

        expect(result).toBe(true);
        expect(authRegistrationPort.findAdopterByNickname).toHaveBeenCalledWith('행복입양자');
    });

    it('닉네임이 존재하지 않으면 false를 반환한다', async () => {
        authRegistrationPort.findAdopterByNickname.mockResolvedValue(null);

        const result = await useCase.execute('새닉네임');

        expect(result).toBe(false);
    });
});
