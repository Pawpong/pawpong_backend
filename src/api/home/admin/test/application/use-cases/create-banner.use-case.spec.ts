import { CreateBannerUseCase } from '../../../application/use-cases/create-banner.use-case';
import { HomeBannerCatalogService } from '../../../../domain/services/home-banner-catalog.service';
import { HomeBannerSnapshot } from '../../../../application/ports/home-content-reader.port';
import { HomeAssetUrlPort } from '../../../../application/ports/home-asset-url.port';

function makeBannerSnapshot(overrides: Partial<HomeBannerSnapshot> = {}): HomeBannerSnapshot {
    return {
        id: 'banner-1',
        desktopImageFileName: 'new-desktop.jpg',
        mobileImageFileName: 'new-mobile.jpg',
        linkType: 'internal',
        linkUrl: '/breeder/abc',
        order: 1,
        isActive: true,
        ...overrides,
    };
}

function makeManager(createdBanner: HomeBannerSnapshot) {
    return {
        readAllBanners: jest.fn(),
        createBanner: jest.fn().mockResolvedValue(createdBanner),
        updateBanner: jest.fn(),
        deleteBanner: jest.fn(),
        readAllFaqs: jest.fn(),
        createFaq: jest.fn(),
        updateFaq: jest.fn(),
        deleteFaq: jest.fn(),
    };
}

function makeAssetUrlPort(): HomeAssetUrlPort {
    return {
        generateSignedUrl: jest.fn().mockImplementation((f: string) => `signed:${f}`),
    };
}

describe('배너 생성 유스케이스 (Admin)', () => {
    const catalogService = new HomeBannerCatalogService();

    it('배너를 생성하고 결과를 반환한다', async () => {
        const useCase = new CreateBannerUseCase(makeManager(makeBannerSnapshot()), catalogService, makeAssetUrlPort());

        const result = await useCase.execute({
            desktopImageFileName: 'new-desktop.jpg',
            linkType: 'internal',
            linkUrl: '/breeder/abc',
            order: 1,
            isActive: true,
        });

        expect(result.bannerId).toBe('banner-1');
        expect(result.desktopImageUrl).toContain('new-desktop.jpg');
    });
});
