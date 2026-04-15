import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { GetAdopterApplicationsUseCase } from '../../../application/use-cases/get-adopter-applications.use-case';
import { AdopterApplicationListAssemblerService } from '../../../domain/services/adopter-application-list-assembler.service';
import { AdopterPaginationAssemblerService } from '../../../domain/services/adopter-pagination-assembler.service';

describe('입양자 상담 신청 목록 조회 유스케이스', () => {
    const adopterProfilePort = { findById: jest.fn() };
    const adopterApplicationReaderPort = {
        findBreederIdsByAnimalType: jest.fn(),
        countByAdopterId: jest.fn(),
        findPagedByAdopterId: jest.fn(),
    };
    const adopterBreederReaderPort = { findById: jest.fn() };
    const adopterFileUrlPort = { generateOneSafe: jest.fn().mockReturnValue('https://cdn.test/image.jpg') };

    const assemblerService = new AdopterApplicationListAssemblerService(new AdopterPaginationAssemblerService());

    const useCase = new GetAdopterApplicationsUseCase(
        adopterProfilePort as any,
        adopterApplicationReaderPort as any,
        adopterBreederReaderPort as any,
        adopterFileUrlPort as any,
        assemblerService,
    );

    const mockApplication = {
        _id: { toString: () => 'app-1' },
        breederId: { toString: () => 'breeder-1' },
        adopterId: { toString: () => 'user-1' },
        petId: undefined,
        petName: undefined,
        status: 'consultation_pending',
        appliedAt: new Date('2026-04-01T00:00:00.000Z'),
        processedAt: undefined,
        customResponses: [],
    };

    const mockBreeder = {
        nickname: '행복브리더',
        name: '행복브리더',
        profileImageFileName: null,
        verification: { level: 'new' },
        profile: { specialization: ['dog'] },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('신청 목록을 페이지네이션으로 정상 조회한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterApplicationReaderPort.countByAdopterId.mockResolvedValue(1);
        adopterApplicationReaderPort.findPagedByAdopterId.mockResolvedValue([mockApplication]);
        adopterBreederReaderPort.findById.mockResolvedValue(mockBreeder);

        const result = await useCase.execute('user-1', 1, 10);

        expect(result.items).toHaveLength(1);
        expect(result.pagination.totalItems).toBe(1);
        expect(result.items[0].applicationId).toBe('app-1');
    });

    it('입양자 정보가 없으면 DomainNotFoundError를 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('user-1', 1, 10)).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('user-1', 1, 10)).rejects.toThrow('입양자 정보를 찾을 수 없습니다.');
    });

    it('animalType 필터를 적용하면 breederIds로 필터링한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterApplicationReaderPort.findBreederIdsByAnimalType.mockResolvedValue(['breeder-1']);
        adopterApplicationReaderPort.countByAdopterId.mockResolvedValue(1);
        adopterApplicationReaderPort.findPagedByAdopterId.mockResolvedValue([mockApplication]);
        adopterBreederReaderPort.findById.mockResolvedValue(mockBreeder);

        const result = await useCase.execute('user-1', 1, 10, 'dog');

        expect(adopterApplicationReaderPort.findBreederIdsByAnimalType).toHaveBeenCalledWith('dog');
        expect(result.items).toHaveLength(1);
    });

    it('animalType 필터링 결과 breederIds가 비어있으면 빈 목록을 반환한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterApplicationReaderPort.findBreederIdsByAnimalType.mockResolvedValue([]);

        const result = await useCase.execute('user-1', 1, 10, 'cat');

        expect(result.items).toHaveLength(0);
        expect(result.pagination.totalItems).toBe(0);
        expect(adopterApplicationReaderPort.findPagedByAdopterId).not.toHaveBeenCalled();
    });

    it('목록이 비어있으면 빈 배열을 반환한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterApplicationReaderPort.countByAdopterId.mockResolvedValue(0);
        adopterApplicationReaderPort.findPagedByAdopterId.mockResolvedValue([]);

        const result = await useCase.execute('user-1', 1, 10);

        expect(result.items).toHaveLength(0);
        expect(result.pagination.totalItems).toBe(0);
    });
});
