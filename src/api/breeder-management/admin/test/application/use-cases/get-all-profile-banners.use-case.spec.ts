import { BreederManagementBannerResultMapperService } from '../../../domain/services/breeder-management-banner-result-mapper.service';
import { GetAllProfileBannersUseCase } from '../../../application/use-cases/get-all-profile-banners.use-case';
import { BreederManagementAdminBannerReaderPort, ProfileBannerSnapshot } from '../../../application/ports/breeder-management-admin-banner-reader.port';
import { BreederManagementFileUrlPort } from '../../../../application/ports/breeder-management-file-url.port';

function makeProfileBanner(overrides: Partial<ProfileBannerSnapshot> = {}): ProfileBannerSnapshot {
    return {
        bannerId: 'banner-1',
        imageFileName: 'profile/banner-1.png',
        bannerType: 'login',
        order: 1,
        isActive: true,
        ...overrides,
    };
}

function makeReader(banners: ProfileBannerSnapshot[] = []): BreederManagementAdminBannerReaderPort {
    return {
        readAllProfile: jest.fn().mockResolvedValue(banners),
        readActiveProfile: jest.fn(),
        readAllCounsel: jest.fn(),
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

describe('프로필 배너 전체 목록 조회 유스케이스', () => {
    it('모든 프로필 배너를 반환한다', async () => {
        const useCase = new GetAllProfileBannersUseCase(
            makeReader([makeProfileBanner(), makeProfileBanner({ bannerId: 'banner-2', bannerType: 'signup' })]),
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
    });

    it('비활성 배너도 포함하여 반환한다', async () => {
        const useCase = new GetAllProfileBannersUseCase(
            makeReader([makeProfileBanner({ isActive: false })]),
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        const result = await useCase.execute();

        expect(result[0].isActive).toBe(false);
    });

    it('배너가 없으면 빈 배열을 반환한다', async () => {
        const useCase = new GetAllProfileBannersUseCase(
            makeReader([]),
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });
});
