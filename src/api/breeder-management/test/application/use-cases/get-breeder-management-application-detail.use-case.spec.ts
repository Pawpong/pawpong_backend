import { DomainNotFoundError } from '../../../../../common/error/domain.error';

import { GetBreederManagementApplicationDetailUseCase } from '../../../application/use-cases/get-breeder-management-application-detail.use-case';
import { BreederManagementApplicationDetailAssemblerService } from '../../../domain/services/breeder-management-application-detail-assembler.service';

describe('브리더 입양 신청 상세 조회 유스케이스', () => {
    const breederManagementApplicationWorkflowPort = {
        findApplicationByIdAndBreeder: jest.fn(),
    };

    const useCase = new GetBreederManagementApplicationDetailUseCase(
        breederManagementApplicationWorkflowPort as any,
        new BreederManagementApplicationDetailAssemblerService(),
    );

    const mockApplication = {
        _id: { toString: () => 'app-1' },
        adopterId: { toString: () => 'adopter-1' },
        adopterName: '입양자1',
        adopterEmail: 'adopter@test.com',
        adopterPhone: '01011112222',
        petId: { toString: () => 'pet-1' },
        petName: '뭉치',
        status: 'pending',
        standardResponses: [],
        customResponses: [],
        appliedAt: new Date('2026-04-01'),
        processedAt: null,
        breederNotes: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 입양 신청 상세를 반환한다', async () => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(mockApplication);

        const result = await useCase.execute('breeder-1', 'app-1');

        expect(result.applicationId).toBe('app-1');
        expect(result.adopterId).toBe('adopter-1');
        expect(result.status).toBe('pending');
        expect(breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder).toHaveBeenCalledWith(
            'app-1',
            'breeder-1',
        );
    });

    it('신청을 찾을 수 없거나 권한이 없으면 도메인 not found 예외를 던진다', async () => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(null);

        await expect(useCase.execute('breeder-1', 'nonexistent-app')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('breeder-1', 'nonexistent-app')).rejects.toThrow(
            '해당 입양 신청을 찾을 수 없거나 조회 권한이 없습니다.',
        );
    });
});
