import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { BreederManagementBannerResultMapperService } from '../../../domain/services/breeder-management-banner-result-mapper.service';
import { UpdateCounselBannerUseCase } from '../../../application/use-cases/update-counsel-banner.use-case';
import { BreederManagementAdminBannerWriterPort } from '../../../application/ports/breeder-management-admin-banner-writer.port';
import { BreederManagementFileUrlPort } from '../../../../application/ports/breeder-management-file-url.port';

describe('상담 배너 수정 유스케이스', () => {
    const fileUrlPort: BreederManagementFileUrlPort = {
        generateOne: jest.fn().mockReturnValue('https://signed.example.com/counsel-banners/banner-1.png'),
        generateOneSafe: jest.fn(),
        generateMany: jest.fn(),
    };

    it('상담 배너가 있으면 수정된 응답을 반환한다', async () => {
        const bannerWriter: BreederManagementAdminBannerWriterPort = {
            createProfile: jest.fn(),
            updateProfile: jest.fn(),
            deleteProfile: jest.fn(),
            createCounsel: jest.fn(),
            updateCounsel: jest.fn().mockResolvedValue({
                bannerId: 'banner-1',
                imageFileName: 'counsel-banners/banner-1.png',
                linkType: 'external',
                linkUrl: 'https://pawpong.kr/counsel',
                title: '수정된 상담 배너',
                description: '설명',
                order: 2,
                isActive: true,
            }),
            deleteCounsel: jest.fn(),
        };
        const useCase = new UpdateCounselBannerUseCase(
            bannerWriter,
            new BreederManagementBannerResultMapperService(fileUrlPort),
        );

        await expect(useCase.execute('banner-1', { title: '수정된 상담 배너' })).resolves.toMatchObject({
            bannerId: 'banner-1',
            title: '수정된 상담 배너',
        });
    });

    it('상담 배너가 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new UpdateCounselBannerUseCase(
            {
                createProfile: jest.fn(),
                updateProfile: jest.fn(),
                deleteProfile: jest.fn(),
                createCounsel: jest.fn(),
                updateCounsel: jest.fn().mockResolvedValue(null),
                deleteCounsel: jest.fn(),
            },
            new BreederManagementBannerResultMapperService(fileUrlPort),
        );

        await expect(useCase.execute('missing', { title: '수정' })).rejects.toBeInstanceOf(DomainNotFoundError);
    });
});
