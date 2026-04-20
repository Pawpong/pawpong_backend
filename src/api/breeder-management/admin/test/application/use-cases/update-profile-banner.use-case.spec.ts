import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { BreederManagementBannerResultMapperService } from '../../../domain/services/breeder-management-banner-result-mapper.service';
import { UpdateProfileBannerUseCase } from '../../../application/use-cases/update-profile-banner.use-case';
import { BreederManagementAdminBannerWriterPort } from '../../../application/ports/breeder-management-admin-banner-writer.port';
import { BreederManagementFileUrlPort } from '../../../../application/ports/breeder-management-file-url.port';

describe('프로필 배너 수정 유스케이스', () => {
    const fileUrlPort: BreederManagementFileUrlPort = {
        generateOne: jest.fn().mockReturnValue('https://signed.example.com/profile-banners/banner-1.png'),
        generateOneSafe: jest.fn(),
        generateMany: jest.fn(),
    };

    it('프로필 배너가 있으면 수정된 응답을 반환한다', async () => {
        const bannerWriter: BreederManagementAdminBannerWriterPort = {
            createProfile: jest.fn(),
            updateProfile: jest.fn().mockResolvedValue({
                bannerId: 'banner-1',
                imageFileName: 'profile-banners/banner-1.png',
                bannerType: 'signup',
                linkType: 'external',
                linkUrl: 'https://pawpong.kr',
                title: '수정됨',
                description: '설명',
                order: 2,
                isActive: true,
            }),
            deleteProfile: jest.fn(),
            createCounsel: jest.fn(),
            updateCounsel: jest.fn(),
            deleteCounsel: jest.fn(),
        };
        const useCase = new UpdateProfileBannerUseCase(
            bannerWriter,
            new BreederManagementBannerResultMapperService(fileUrlPort),
        );

        await expect(useCase.execute('banner-1', { title: '수정됨' })).resolves.toMatchObject({
            bannerId: 'banner-1',
            title: '수정됨',
        });
    });

    it('프로필 배너가 없으면 예외을 던진다', async () => {
        const useCase = new UpdateProfileBannerUseCase(
            {
                createProfile: jest.fn(),
                updateProfile: jest.fn().mockResolvedValue(null),
                deleteProfile: jest.fn(),
                createCounsel: jest.fn(),
                updateCounsel: jest.fn(),
                deleteCounsel: jest.fn(),
            },
            new BreederManagementBannerResultMapperService(fileUrlPort),
        );

        await expect(useCase.execute('missing', { title: '수정' })).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
