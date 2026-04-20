import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { DeleteBannerUseCase } from '../../../application/use-cases/delete-banner.use-case';

describe('홈 배너 삭제 유스케이스', () => {
    it('존재하는 배너면 삭제한다', async () => {
        const homeAdminManager = {
            deleteBanner: jest.fn().mockResolvedValue(true),
        };
        const useCase = new DeleteBannerUseCase(homeAdminManager as any);

        await expect(useCase.execute('banner-1')).resolves.toBeUndefined();
        expect(homeAdminManager.deleteBanner).toHaveBeenCalledWith('banner-1');
    });

    it('대상이 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new DeleteBannerUseCase({
            deleteBanner: jest.fn().mockResolvedValue(false),
        } as any);

        await expect(useCase.execute('missing')).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
