import { BreederManagementBannerResultMapperService } from '../../../domain/services/breeder-management-banner-result-mapper.service';
import { CreateCounselBannerUseCase } from '../../../application/use-cases/create-counsel-banner.use-case';
import { BreederManagementAdminBannerWriterPort } from '../../../application/ports/breeder-management-admin-banner-writer.port';
import { BreederManagementFileUrlPort } from '../../../../application/ports/breeder-management-file-url.port';

function makeWriter(): BreederManagementAdminBannerWriterPort {
    return {
        createProfile: jest.fn(),
        updateProfile: jest.fn(),
        deleteProfile: jest.fn(),
        createCounsel: jest.fn().mockResolvedValue({
            bannerId: 'banner-1',
            imageFileName: 'counsel/banner-1.png',
            order: 1,
            isActive: true,
        }),
        updateCounsel: jest.fn(),
        deleteCounsel: jest.fn(),
    };
}

function makeFileUrlPort(): BreederManagementFileUrlPort {
    return {
        generateOne: jest.fn().mockReturnValue('https://cdn.example.com/banner.png'),
        generateOneSafe: jest.fn(),
        generateMany: jest.fn(),
    };
}

describe('상담 배너 생성 유스케이스', () => {
    it('상담 배너를 생성하고 결과 객체를 반환한다', async () => {
        const useCase = new CreateCounselBannerUseCase(
            makeWriter(),
            new BreederManagementBannerResultMapperService(makeFileUrlPort()),
        );

        const result = await useCase.execute({
            imageFileName: 'counsel/banner-1.png',
            order: 1,
            isActive: true,
        });

        expect(result.bannerId).toBe('banner-1');
        expect(result.imageUrl).toBeDefined();
    });
});
