import { BreederManagementBannerResultMapperService } from '../../../domain/services/breeder-management-banner-result-mapper.service';
import { GetActiveCounselBannersUseCase } from '../../../application/use-cases/get-active-counsel-banners.use-case';
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
        readAllCounsel: jest.fn(),
        readActiveCounsel: jest.fn().mockResolvedValue(banners),
    };
}

function makeFileUrlPort(): BreederManagementFileUrlPort {
    return {
        generateOne: jest.fn().mockReturnValue('https://cdn.example.com/banner.png'),
        generateOneSafe: jest.fn(),
        generateMany: jest.fn(),
    };
}

describe('활성 상담 배너 목록 조회 유스케이스', () => {
    it('활성 상담 배너 목록을 반환한다', async () => {
        const useCase = new GetActiveCounselBannersUseCase(
            makeReader([makeCounselBanner()]),
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        const result = await useCase.execute();

        expect(result).toHaveLength(1);
        expect(result[0].isActive).toBe(true);
    });

    it('활성 배너가 없으면 빈 배열을 반환한다', async () => {
        const useCase = new GetActiveCounselBannersUseCase(
            makeReader([]),
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });
});
