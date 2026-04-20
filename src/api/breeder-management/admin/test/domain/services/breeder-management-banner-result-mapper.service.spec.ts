import { BreederManagementBannerResultMapperService } from '../../../domain/services/breeder-management-banner-result-mapper.service';
import { BreederManagementFileUrlPort } from '../../../../application/ports/breeder-management-file-url.port';

function makeFileUrlPort(signedUrl = 'https://signed.example.com/x.png'): BreederManagementFileUrlPort {
    return {
        generateOne: jest.fn().mockReturnValue(signedUrl),
        generateOneSafe: jest.fn(),
        generateMany: jest.fn(),
    };
}

describe('BreederManagementBannerResultMapperService', () => {
    it('프로필 배너를 매핑하고 bannerType을 포함한다', () => {
        const fileUrl = makeFileUrlPort();
        const service = new BreederManagementBannerResultMapperService(fileUrl);

        const result = service.toProfileResult({
            bannerId: 'b-1',
            imageFileName: 'profile/b-1.png',
            bannerType: 'login',
            order: 1,
            isActive: true,
        });

        expect(result.bannerId).toBe('b-1');
        expect(result.bannerType).toBe('login');
        expect(result.imageUrl).toBe('https://signed.example.com/x.png');
        expect(fileUrl.generateOne).toHaveBeenCalledWith('profile/b-1.png', 60 * 24);
    });

    it('상담 배너는 bannerType 없이 매핑된다', () => {
        const service = new BreederManagementBannerResultMapperService(makeFileUrlPort());

        const result = service.toCounselResult({
            bannerId: 'b-2',
            imageFileName: 'counsel/b-2.png',
            order: 1,
            isActive: true,
        });

        expect(result.bannerId).toBe('b-2');
        expect((result as any).bannerType).toBeUndefined();
    });

    it('isActive가 명시적으로 false가 아니면 true를 반환한다', () => {
        const service = new BreederManagementBannerResultMapperService(makeFileUrlPort());
        const result = service.toCounselResult({
            bannerId: 'b-3',
            imageFileName: 'c/b-3.png',
            order: 1,
            isActive: undefined as any,
        });
        expect(result.isActive).toBe(true);
    });
});
