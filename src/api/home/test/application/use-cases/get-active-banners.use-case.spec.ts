import { GetActiveBannersUseCase } from '../../../application/use-cases/get-active-banners.use-case';
import { HomeBannerCatalogService } from '../../../domain/services/home-banner-catalog.service';
import {
    HOME_CONTENT_READER_PORT,
    HomeContentReaderPort,
    HomeBannerSnapshot,
} from '../../../application/ports/home-content-reader.port';
import { HOME_ASSET_URL_PORT, HomeAssetUrlPort } from '../../../application/ports/home-asset-url.port';

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

function makeContentReader(banners: HomeBannerSnapshot[] = []): HomeContentReaderPort {
    return {
        readActiveBanners: jest.fn().mockResolvedValue(banners),
        readFaqsFor: jest.fn().mockResolvedValue([]),
        readAvailablePets: jest.fn().mockResolvedValue([]),
    };
}

function makeAssetUrlPort(): HomeAssetUrlPort {
    return {
        generateSignedUrl: jest.fn().mockImplementation((fileName: string) => `https://cdn.example.com/${fileName}`),
    };
}

describe('활성 배너 조회 유스케이스', () => {
    let useCase: GetActiveBannersUseCase;
    let contentReader: HomeContentReaderPort;
    let assetUrlPort: HomeAssetUrlPort;
    const catalogService = new HomeBannerCatalogService();

    beforeEach(() => {
        contentReader = makeContentReader();
        assetUrlPort = makeAssetUrlPort();
        useCase = new GetActiveBannersUseCase(contentReader, catalogService, assetUrlPort);
    });

    it('활성 배너가 없으면 빈 배열을 반환한다', async () => {
        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('배너의 이미지 파일명으로 서명된 URL을 생성한다', async () => {
        contentReader = makeContentReader([makeBannerSnapshot()]);
        useCase = new GetActiveBannersUseCase(contentReader, catalogService, assetUrlPort);

        const result = await useCase.execute();

        expect(result[0].desktopImageUrl).toContain('desktop.jpg');
        expect(result[0].mobileImageUrl).toContain('mobile.jpg');
    });

    it('배너 메타 정보를 그대로 반환한다', async () => {
        contentReader = makeContentReader([
            makeBannerSnapshot({
                id: 'banner-abc',
                linkType: 'external',
                linkUrl: 'https://external.com',
                title: '이벤트',
                order: 3,
            }),
        ]);
        useCase = new GetActiveBannersUseCase(contentReader, catalogService, assetUrlPort);

        const result = await useCase.execute();

        expect(result[0].bannerId).toBe('banner-abc');
        expect(result[0].linkType).toBe('external');
        expect(result[0].linkUrl).toBe('https://external.com');
        expect(result[0].title).toBe('이벤트');
        expect(result[0].order).toBe(3);
    });

    it('imageFileName이 있고 desktop/mobile 파일이 없으면 imageFileName으로 대체한다', async () => {
        contentReader = makeContentReader([
            makeBannerSnapshot({
                desktopImageFileName: undefined,
                mobileImageFileName: undefined,
                imageFileName: 'fallback.jpg',
            }),
        ]);
        useCase = new GetActiveBannersUseCase(contentReader, catalogService, assetUrlPort);

        const result = await useCase.execute();

        expect(result[0].desktopImageFileName).toBe('fallback.jpg');
        expect(result[0].mobileImageFileName).toBe('fallback.jpg');
    });
});
