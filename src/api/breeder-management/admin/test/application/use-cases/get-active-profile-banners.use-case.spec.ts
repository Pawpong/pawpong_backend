import { BreederManagementBannerResultMapperService } from '../../../domain/services/breeder-management-banner-result-mapper.service';
import { GetActiveProfileBannersUseCase } from '../../../application/use-cases/get-active-profile-banners.use-case';
import {
    BreederManagementAdminBannerReaderPort,
    ProfileBannerSnapshot,
} from '../../../application/ports/breeder-management-admin-banner-reader.port';
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
        readAllProfile: jest.fn(),
        readActiveProfile: jest.fn().mockResolvedValue(banners),
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

describe('활성 프로필 배너 목록 조회 유스케이스', () => {
    it('활성 프로필 배너 목록을 반환한다', async () => {
        const useCase = new GetActiveProfileBannersUseCase(
            makeReader([makeProfileBanner()]),
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        const result = await useCase.execute();

        expect(result).toHaveLength(1);
        expect(result[0].isActive).toBe(true);
    });

    it('bannerType 필터를 전달한다', async () => {
        const reader = makeReader([makeProfileBanner({ bannerType: 'signup' })]);
        const useCase = new GetActiveProfileBannersUseCase(
            reader,
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        await useCase.execute('signup');

        expect(reader.readActiveProfile).toHaveBeenCalledWith('signup');
    });

    it('활성 배너가 없으면 빈 배열을 반환한다', async () => {
        const useCase = new GetActiveProfileBannersUseCase(
            makeReader([]),
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });
});
