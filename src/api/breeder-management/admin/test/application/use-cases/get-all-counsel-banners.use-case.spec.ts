import { BreederManagementBannerResultMapperService } from '../../../domain/services/breeder-management-banner-result-mapper.service';
import { GetAllCounselBannersUseCase } from '../../../application/use-cases/get-all-counsel-banners.use-case';
import { BreederManagementAdminBannerReaderPort, CounselBannerSnapshot } from '../../../application/ports/breeder-management-admin-banner-reader.port';
import { BreederManagementFileUrlPort } from '../../../../application/ports/breeder-management-file-url.port';

function makeCounselBanner(overrides: Partial<CounselBannerSnapshot> = {}): CounselBannerSnapshot {
    return {
        bannerId: 'banner-1',
        imageFileName: 'counsel/banner-1.png',
        order: 1,
        isActive: true,
        ...overrides,
    };
}

function makeReader(banners: CounselBannerSnapshot[] = []): BreederManagementAdminBannerReaderPort {
    return {
        readAllProfile: jest.fn(),
        readActiveProfile: jest.fn(),
        readAllCounsel: jest.fn().mockResolvedValue(banners),
        readActiveCounsel: jest.fn(),
    };
}

function makeFileUrlPort(): BreederManagementFileUrlPort {
    return {
        generateOne: jest.fn().mockReturnValue('https://cdn.example.com/banner.png'),
        generateOneSafe: jest.fn(),
        generateMany: jest.fn(),
    };
}

describe('상담 배너 전체 목록 조회 유스케이스', () => {
    it('모든 상담 배너를 반환한다', async () => {
        const useCase = new GetAllCounselBannersUseCase(
            makeReader([makeCounselBanner(), makeCounselBanner({ bannerId: 'banner-2', isActive: false })]),
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
        expect(result[0].bannerId).toBe('banner-1');
    });

    it('비활성 배너도 포함하여 반환한다', async () => {
        const useCase = new GetAllCounselBannersUseCase(
            makeReader([makeCounselBanner({ isActive: false })]),
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        const result = await useCase.execute();

        expect(result).toHaveLength(1);
        expect(result[0].isActive).toBe(false);
    });

    it('배너가 없으면 빈 배열을 반환한다', async () => {
        const useCase = new GetAllCounselBannersUseCase(
            makeReader([]),
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });
});
