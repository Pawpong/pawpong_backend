import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { UpdateBannerUseCase } from '../../../application/use-cases/update-banner.use-case';
import { HomeBannerCatalogService } from '../../../../domain/services/home-banner-catalog.service';

describe('홈 배너 수정 유스케이스', () => {
    it('배너가 있으면 결과를 반환한다', async () => {
        const useCase = new UpdateBannerUseCase(
            {
                updateBanner: jest.fn().mockResolvedValue({
                    id: 'banner-1',
                    imageFileName: 'banner.jpg',
                    desktopImageFileName: 'banner-desktop.jpg',
                    mobileImageFileName: 'banner-mobile.jpg',
                    linkType: 'external',
                    linkUrl: 'https://example.com',
                    title: '테스트 배너',
                    description: '설명',
                    order: 1,
                    isActive: true,
                    targetAudience: ['guest'],
                }),
            } as any,
            new HomeBannerCatalogService(),
            {
                generateSignedUrl: jest.fn().mockImplementation((fileName: string) => `signed:${fileName}`),
            },
        );

        await expect(useCase.execute('banner-1', { title: '수정된 배너' })).resolves.toMatchObject({
            bannerId: 'banner-1',
            desktopImageUrl: 'signed:banner-desktop.jpg',
            mobileImageUrl: 'signed:banner-mobile.jpg',
        });
    });

    it('대상이 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new UpdateBannerUseCase(
            {
                updateBanner: jest.fn().mockResolvedValue(null),
            } as any,
            new HomeBannerCatalogService(),
            {
                generateSignedUrl: jest.fn(),
            },
        );

        await expect(useCase.execute('missing', {})).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
