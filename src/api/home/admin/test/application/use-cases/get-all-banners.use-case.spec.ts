import { GetAllBannersUseCase } from '../../../application/use-cases/get-all-banners.use-case';
import { HomeBannerCatalogService } from '../../../../domain/services/home-banner-catalog.service';
import { HomeBannerSnapshot } from '../../../../application/ports/home-content-reader.port';
import { HomeAssetUrlPort } from '../../../../application/ports/home-asset-url.port';

function makeBannerSnapshot(overrides: Partial<HomeBannerSnapshot> = {}): HomeBannerSnapshot {
    return {
        id: 'banner-1',
        desktopImageFileName: 'desktop.jpg',
        mobileImageFileName: 'mobile.jpg',
        linkType: 'internal',
        linkUrl: '/breeder/123',
        order: 1,
        isActive: true,
        ...overrides,
    };
}

function makeManager(banners: HomeBannerSnapshot[] = []) {
    return {
        readAllBanners: jest.fn().mockResolvedValue(banners),
        createBanner: jest.fn(),
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

describe('전체 배너 목록 조회 유스케이스 (Admin)', () => {
    const catalogService = new HomeBannerCatalogService();

    it('전체 배너 목록을 반환한다', async () => {
        const useCase = new GetAllBannersUseCase(makeManager([makeBannerSnapshot()]), catalogService, makeAssetUrlPort());

        const result = await useCase.execute();

        expect(result).toHaveLength(1);
        expect(result[0].bannerId).toBe('banner-1');
    });

    it('배너가 없으면 빈 배열을 반환한다', async () => {
        const useCase = new GetAllBannersUseCase(makeManager([]), catalogService, makeAssetUrlPort());

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('각 배너 이미지에 서명된 URL이 생성된다', async () => {
        const useCase = new GetAllBannersUseCase(
            makeManager([makeBannerSnapshot({ desktopImageFileName: 'hero.jpg' })]),
            catalogService,
            makeAssetUrlPort(),
        );

        const result = await useCase.execute();

        expect(result[0].desktopImageUrl).toContain('hero.jpg');
    });
});
