import { HomeBannerCatalogService } from '../../../domain/services/home-banner-catalog.service';

describe('HomeBannerCatalogService', () => {
    const service = new HomeBannerCatalogService();
    const signedUrl = (name: string) => `https://cdn.example.com/${name}`;

    it('desktop/mobile 이미지 파일명이 있으면 각각 서명 URL을 생성한다', () => {
        const result = service.buildResults(
            [
                {
                    id: 'b-1',
                    desktopImageFileName: 'banner/desktop.png',
                    mobileImageFileName: 'banner/mobile.png',
                    order: 1,
                    isActive: true,
                } as any,
            ],
            signedUrl,
        );
        expect(result[0].desktopImageUrl).toContain('banner/desktop.png');
        expect(result[0].mobileImageUrl).toContain('banner/mobile.png');
    });

    it('imageFileName이 있고 desktop/mobile이 없으면 fallback한다', () => {
        const result = service.buildResults(
            [{ id: 'b-1', imageFileName: 'banner/x.png', order: 1, isActive: true } as any],
            signedUrl,
        );
        expect(result[0].desktopImageUrl).toContain('banner/x.png');
        expect(result[0].mobileImageUrl).toContain('banner/x.png');
    });

    it('모든 파일명이 없으면 빈 문자열 URL을 반환한다', () => {
        const result = service.buildResults([{ id: 'b-1', order: 1, isActive: true } as any], signedUrl);
        expect(result[0].desktopImageUrl).toBe('');
        expect(result[0].mobileImageUrl).toBe('');
    });

    it('isActive가 false면 false, 아니면 true', () => {
        const result = service.buildResults(
            [
                { id: 'b-1', order: 1, isActive: false, imageFileName: 'x.png' } as any,
                { id: 'b-2', order: 2, isActive: undefined, imageFileName: 'y.png' } as any,
            ],
            signedUrl,
        );
        expect(result[0].isActive).toBe(false);
        expect(result[1].isActive).toBe(true);
    });

    it('targetAudience가 없으면 빈 배열', () => {
        const result = service.buildResults([{ id: 'b-1', order: 1, imageFileName: 'x.png' } as any], signedUrl);
        expect(result[0].targetAudience).toEqual([]);
    });
});
