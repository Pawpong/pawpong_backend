import { CheckBreederNameDuplicateUseCase } from '../../../application/use-cases/check-breeder-name-duplicate.use-case';

describe('브리더 이름 중복 확인 유스케이스', () => {
    const authRegistrationPort = {
        findBreederByName: jest.fn(),
    };

    const useCase = new CheckBreederNameDuplicateUseCase(authRegistrationPort as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('브리더 이름이 이미 존재하면 true를 반환한다', async () => {
        authRegistrationPort.findBreederByName.mockResolvedValue({ name: '행복브리더' });

        const result = await useCase.execute('행복브리더');

        expect(result).toBe(true);
        expect(authRegistrationPort.findBreederByName).toHaveBeenCalledWith('행복브리더');
    });

    it('브리더 이름이 존재하지 않으면 false를 반환한다', async () => {
        authRegistrationPort.findBreederByName.mockResolvedValue(null);

        const result = await useCase.execute('새브리더이름');

        expect(result).toBe(false);
    });
});
