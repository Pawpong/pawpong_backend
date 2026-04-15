import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { ApplicationStatus } from '../../../../../common/enum/user.enum';
import { UpdateBreederManagementApplicationStatusUseCase } from '../../../application/use-cases/update-breeder-management-application-status.use-case';
import { BreederManagementApplicationStatusResultMapperService } from '../../../domain/services/breeder-management-application-status-result-mapper.service';

describe('브리더 입양 신청 상태 변경 유스케이스', () => {
    const breederManagementApplicationWorkflowPort = {
        findApplicationByIdAndBreeder: jest.fn(),
        updateStatus: jest.fn(),
        incrementCompletedAdoptions: jest.fn(),
        notifyConsultationCompleted: jest.fn(),
    };
    const mockLogger = {
        logStart: jest.fn(),
        logError: jest.fn(),
        logWarning: jest.fn(),
        logSuccess: jest.fn(),
        log: jest.fn(),
    };

    const useCase = new UpdateBreederManagementApplicationStatusUseCase(
        breederManagementApplicationWorkflowPort as any,
        new BreederManagementApplicationStatusResultMapperService(),
        mockLogger as any,
    );

    const mockApplication = {
        _id: 'app-1',
        adopterId: { toString: () => 'adopter-1' },
        status: ApplicationStatus.CONSULTATION_PENDING,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('상담 완료 상태로 변경하면 알림을 발송한다', async () => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(mockApplication);
        breederManagementApplicationWorkflowPort.updateStatus.mockResolvedValue(undefined);
        breederManagementApplicationWorkflowPort.notifyConsultationCompleted.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', 'app-1', {
            applicationId: 'app-1',
            status: ApplicationStatus.CONSULTATION_COMPLETED,
        });

        expect(result.message).toBeDefined();
        expect(breederManagementApplicationWorkflowPort.notifyConsultationCompleted).toHaveBeenCalledWith({
            breederId: 'breeder-1',
            adopterId: 'adopter-1',
            applicationId: 'app-1',
        });
        expect(breederManagementApplicationWorkflowPort.incrementCompletedAdoptions).not.toHaveBeenCalled();
    });

    it('입양 승인 상태로 변경하면 완료 입양 수를 증가시킨다', async () => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(mockApplication);
        breederManagementApplicationWorkflowPort.updateStatus.mockResolvedValue(undefined);
        breederManagementApplicationWorkflowPort.incrementCompletedAdoptions.mockResolvedValue(undefined);

        await useCase.execute('breeder-1', 'app-1', {
            applicationId: 'app-1',
            status: ApplicationStatus.ADOPTION_APPROVED,
        });

        expect(breederManagementApplicationWorkflowPort.incrementCompletedAdoptions).toHaveBeenCalledWith('breeder-1');
        expect(breederManagementApplicationWorkflowPort.notifyConsultationCompleted).not.toHaveBeenCalled();
    });

    it('일반 상태 변경은 알림과 카운트 증가 없이 처리된다', async () => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(mockApplication);
        breederManagementApplicationWorkflowPort.updateStatus.mockResolvedValue(undefined);

        await useCase.execute('breeder-1', 'app-1', {
            applicationId: 'app-1',
            status: ApplicationStatus.ADOPTION_REJECTED,
        });

        expect(breederManagementApplicationWorkflowPort.incrementCompletedAdoptions).not.toHaveBeenCalled();
        expect(breederManagementApplicationWorkflowPort.notifyConsultationCompleted).not.toHaveBeenCalled();
    });

    it('신청을 찾을 수 없으면 DomainNotFoundError를 던진다', async () => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(null);

        await expect(
            useCase.execute('breeder-1', 'nonexistent-app', {
                applicationId: 'nonexistent-app',
                status: ApplicationStatus.CONSULTATION_COMPLETED,
            }),
        ).rejects.toThrow(DomainNotFoundError);
        await expect(
            useCase.execute('breeder-1', 'nonexistent-app', {
                applicationId: 'nonexistent-app',
                status: ApplicationStatus.CONSULTATION_COMPLETED,
            }),
        ).rejects.toThrow('해당 입양 신청을 찾을 수 없습니다.');
    });
});
