import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { DeleteDistrictUseCase } from '../../../application/use-cases/delete-district.use-case';

describe('지역 삭제 유스케이스', () => {
    const districtWriter = {
        delete: jest.fn(),
    };

    const useCase = new DeleteDistrictUseCase(districtWriter as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('존재하는 지역을 정상 삭제한다', async () => {
        districtWriter.delete.mockResolvedValue(true);

        await expect(useCase.execute('district-1')).resolves.toBeUndefined();
        expect(districtWriter.delete).toHaveBeenCalledWith('district-1');
    });

    it('존재하지 않는 지역 삭제 시 DomainNotFoundError를 던진다', async () => {
        districtWriter.delete.mockResolvedValue(false);

        await expect(useCase.execute('nonexistent-id')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
            'ID nonexistent-id에 해당하는 지역을 찾을 수 없습니다.',
        );
    });
});
