import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { DeleteProfileBannerUseCase } from '../../../application/use-cases/delete-profile-banner.use-case';

describe('프로필 배너 삭제 유스케이스', () => {
    it('프로필 배너가 있으면 삭제를 완료한다', async () => {
        const bannerWriter = {
            deleteProfile: jest.fn().mockResolvedValue(true),
        };
        const useCase = new DeleteProfileBannerUseCase(bannerWriter as any);

        await expect(useCase.execute('banner-1')).resolves.toBeUndefined();
        expect(bannerWriter.deleteProfile).toHaveBeenCalledWith('banner-1');
    });

    it('프로필 배너가 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new DeleteProfileBannerUseCase({
            deleteProfile: jest.fn().mockResolvedValue(false),
        } as any);

        await expect(useCase.execute('missing')).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
