import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { DeleteCounselBannerUseCase } from '../../../application/use-cases/delete-counsel-banner.use-case';

describe('상담 배너 삭제 유스케이스', () => {
    it('상담 배너가 있으면 삭제를 완료한다', async () => {
        const bannerWriter = {
            deleteCounsel: jest.fn().mockResolvedValue(true),
        };
        const useCase = new DeleteCounselBannerUseCase(bannerWriter as any);

        await expect(useCase.execute('banner-1')).resolves.toBeUndefined();
        expect(bannerWriter.deleteCounsel).toHaveBeenCalledWith('banner-1');
    });

    it('상담 배너가 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new DeleteCounselBannerUseCase({
            deleteCounsel: jest.fn().mockResolvedValue(false),
        } as any);

        await expect(useCase.execute('missing')).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
