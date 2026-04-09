import { BreederManagementBannerPresentationService } from '../../domain/services/breeder-management-banner-presentation.service';
import { CreateProfileBannerUseCase } from './create-profile-banner.use-case';
import { BreederManagementAdminBannerWriterPort } from '../ports/breeder-management-admin-banner-writer.port';
import { BreederManagementFileUrlPort } from '../../../application/ports/breeder-management-file-url.port';

describe('프로필 배너 생성 유스케이스', () => {
    it('프로필 배너를 생성하고 응답 객체로 변환한다', async () => {
        const bannerWriter: BreederManagementAdminBannerWriterPort = {
            createProfile: jest.fn().mockResolvedValue({
                bannerId: 'banner-1',
                imageFileName: 'profile-banners/banner-1.png',
                bannerType: 'login',
                linkType: 'internal',
                linkUrl: '/breeders/management',
                title: '타이틀',
                description: '설명',
                order: 1,
                isActive: true,
            }),
            updateProfile: jest.fn(),
            deleteProfile: jest.fn(),
            createCounsel: jest.fn(),
            updateCounsel: jest.fn(),
            deleteCounsel: jest.fn(),
        };
        const fileUrlPort: BreederManagementFileUrlPort = {
            generateOne: jest.fn().mockReturnValue('https://signed.example.com/profile-banners/banner-1.png'),
            generateOneSafe: jest.fn(),
            generateMany: jest.fn(),
        };
        const useCase = new CreateProfileBannerUseCase(
            bannerWriter,
            new BreederManagementBannerPresentationService(fileUrlPort),
        );

        await expect(
            useCase.execute({
                imageFileName: 'profile-banners/banner-1.png',
                bannerType: 'login',
                linkType: 'internal',
                linkUrl: '/breeders/management',
                title: '타이틀',
                description: '설명',
                order: 1,
                isActive: true,
            }),
        ).resolves.toMatchObject({
            bannerId: 'banner-1',
            imageUrl: 'https://signed.example.com/profile-banners/banner-1.png',
        });
    });
});
