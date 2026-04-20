import { GetBreederManagementReceivedApplicationsUseCase } from '../../../application/use-cases/get-breeder-management-received-applications.use-case';
import { BreederManagementReceivedApplicationMapperService } from '../../../domain/services/breeder-management-received-application-mapper.service';
import { BreederManagementPaginationAssemblerService } from '../../../domain/services/breeder-management-pagination-assembler.service';

describe('브리더 수신 입양 신청 목록 조회 유스케이스', () => {
    const breederManagementListReaderPort = {
        findReceivedApplications: jest.fn(),
    };

    const useCase = new GetBreederManagementReceivedApplicationsUseCase(
        breederManagementListReaderPort as any,
        new BreederManagementReceivedApplicationMapperService(),
        new BreederManagementPaginationAssemblerService(),
    );

    const mockApplication = {
        _id: 'app-1',
        adopterId: { _id: 'adopter-1', nickname: '입양자닉' },
        adopterName: '입양자1',
        adopterEmail: 'adopter@test.com',
        adopterPhone: '01011112222',
        petId: 'pet-1',
        petName: '뭉치',
        status: 'pending',
        appliedAt: new Date('2026-04-01'),
        processedAt: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 수신 신청 목록을 반환한다', async () => {
        breederManagementListReaderPort.findReceivedApplications.mockResolvedValue({
            applications: [mockApplication],
            total: 1,
        });

        const result = await useCase.execute('breeder-1');

        expect(result.items).toHaveLength(1);
        expect(result.items[0].applicationId).toBe('app-1');
        expect(result.pagination.totalItems).toBe(1);
        expect(breederManagementListReaderPort.findReceivedApplications).toHaveBeenCalledWith('breeder-1', 1, 10);
    });

    it('신청이 없으면 빈 배열을 반환한다', async () => {
        breederManagementListReaderPort.findReceivedApplications.mockResolvedValue({
            applications: [],
            total: 0,
        });

        const result = await useCase.execute('breeder-1', 2, 10);

        expect(result.items).toHaveLength(0);
        expect(result.pagination.totalItems).toBe(0);
        expect(breederManagementListReaderPort.findReceivedApplications).toHaveBeenCalledWith('breeder-1', 2, 10);
    });
});
