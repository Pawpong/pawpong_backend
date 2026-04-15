import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { GetBreederManagementVerificationStatusUseCase } from '../../../application/use-cases/get-breeder-management-verification-status.use-case';
import { BreederManagementVerificationStatusAssemblerService } from '../../../domain/services/breeder-management-verification-status-assembler.service';

describe('브리더 인증 상태 조회 유스케이스', () => {
    const breederManagementProfilePort = {
        findById: jest.fn(),
    };
    const breederManagementFileUrlPort = {
        generateOne: jest.fn().mockReturnValue('https://cdn.example.com/doc.pdf'),
        generateOneSafe: jest.fn().mockReturnValue(null),
        generateMany: jest.fn().mockReturnValue([]),
    };

    const useCase = new GetBreederManagementVerificationStatusUseCase(
        breederManagementProfilePort as any,
        breederManagementFileUrlPort as any,
        new BreederManagementVerificationStatusAssemblerService(),
    );

    const mockBreeder = {
        _id: 'breeder-1',
        verification: {
            status: 'approved',
            plan: 'basic',
            level: 'new',
            submittedAt: new Date('2026-01-01'),
            reviewedAt: new Date('2026-01-02'),
            documents: [],
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        breederManagementFileUrlPort.generateOne.mockReturnValue('https://cdn.example.com/doc.pdf');
    });

    it('정상적으로 인증 상태를 반환한다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(mockBreeder);

        const result = await useCase.execute('breeder-1');

        expect(result).toBeDefined();
        expect(breederManagementProfilePort.findById).toHaveBeenCalledWith('breeder-1');
    });

    it('브리더를 찾을 수 없으면 DomainNotFoundError를 던진다', async () => {
        breederManagementProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('unknown-id')).rejects.toThrow('브리더 정보를 찾을 수 없습니다.');
    });
});
