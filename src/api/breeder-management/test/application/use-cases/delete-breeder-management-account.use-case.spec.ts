import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { DeleteBreederManagementAccountUseCase } from '../../../application/use-cases/delete-breeder-management-account.use-case';
import { BreederManagementAccountCommandResultMapperService } from '../../../domain/services/breeder-management-account-command-result-mapper.service';

describe('브리더 계정 탈퇴 유스케이스', () => {
    const breederManagementAccountCommandPort = {
        findBreederById: jest.fn(),
        countPendingApplications: jest.fn(),
        softDeleteBreeder: jest.fn(),
        deactivateAllAvailablePetsByBreeder: jest.fn(),
        notifyBreederWithdrawal: jest.fn(),
    };
    const mockLogger = {
        logStart: jest.fn(),
        logError: jest.fn(),
        logWarning: jest.fn(),
        logSuccess: jest.fn(),
        log: jest.fn(),
    };

    const useCase = new DeleteBreederManagementAccountUseCase(
        breederManagementAccountCommandPort as any,
        new BreederManagementAccountCommandResultMapperService(),
        mockLogger as any,
    );

    const mockBreeder = {
        _id: 'breeder-1',
        name: '행복브리더',
        emailAddress: 'breeder@test.com',
        accountStatus: 'active',
    };

    const mockDeletedBreeder = {
        ...mockBreeder,
        accountStatus: 'deleted',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 브리더 계정을 탈퇴 처리한다', async () => {
        breederManagementAccountCommandPort.findBreederById.mockResolvedValue(mockBreeder);
        breederManagementAccountCommandPort.countPendingApplications.mockResolvedValue(0);
        breederManagementAccountCommandPort.softDeleteBreeder.mockResolvedValue(undefined);
        breederManagementAccountCommandPort.deactivateAllAvailablePetsByBreeder.mockResolvedValue(3);
        breederManagementAccountCommandPort.notifyBreederWithdrawal.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', { reason: 'no_use' });

        expect(result.breederId).toBe('breeder-1');
        expect(result.deletedAt).toBeDefined();
        expect(result.message).toBeDefined();
        expect(breederManagementAccountCommandPort.softDeleteBreeder).toHaveBeenCalled();
        expect(breederManagementAccountCommandPort.deactivateAllAvailablePetsByBreeder).toHaveBeenCalledWith('breeder-1');
    });

    it('이미 탈퇴된 계정이면 DomainValidationError를 던진다', async () => {
        breederManagementAccountCommandPort.findBreederById.mockResolvedValue(mockDeletedBreeder);

        await expect(useCase.execute('breeder-1', {})).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute('breeder-1', {})).rejects.toThrow('이미 탈퇴된 계정입니다.');
        expect(breederManagementAccountCommandPort.softDeleteBreeder).not.toHaveBeenCalled();
    });

    it('기타 사유를 선택했지만 otherReason이 없으면 DomainValidationError를 던진다', async () => {
        breederManagementAccountCommandPort.findBreederById.mockResolvedValue(mockBreeder);

        await expect(useCase.execute('breeder-1', { reason: 'other' })).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute('breeder-1', { reason: 'other' })).rejects.toThrow('기타 사유를 입력해주세요.');
        expect(breederManagementAccountCommandPort.softDeleteBreeder).not.toHaveBeenCalled();
    });

    it('기타 사유와 내용이 모두 있으면 정상 처리된다', async () => {
        breederManagementAccountCommandPort.findBreederById.mockResolvedValue(mockBreeder);
        breederManagementAccountCommandPort.countPendingApplications.mockResolvedValue(0);
        breederManagementAccountCommandPort.softDeleteBreeder.mockResolvedValue(undefined);
        breederManagementAccountCommandPort.deactivateAllAvailablePetsByBreeder.mockResolvedValue(0);
        breederManagementAccountCommandPort.notifyBreederWithdrawal.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', { reason: 'other', otherReason: '기타 이유 상세' });

        expect(result.breederId).toBe('breeder-1');
        expect(breederManagementAccountCommandPort.softDeleteBreeder).toHaveBeenCalledWith(
            expect.objectContaining({ reason: 'other', otherReason: '기타 이유 상세' }),
        );
    });

    it('브리더를 찾을 수 없으면 DomainNotFoundError를 던진다', async () => {
        breederManagementAccountCommandPort.findBreederById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id', {})).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('unknown-id', {})).rejects.toThrow('브리더 정보를 찾을 수 없습니다.');
        expect(breederManagementAccountCommandPort.softDeleteBreeder).not.toHaveBeenCalled();
    });
});
