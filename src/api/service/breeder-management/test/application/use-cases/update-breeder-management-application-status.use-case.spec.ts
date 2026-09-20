import { DomainConflictError, DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { ApplicationStatus } from '../../../../../../common/enum/user.enum';
import { UpdateBreederManagementApplicationStatusUseCase } from '../../../application/use-cases/update-breeder-management-application-status.use-case';
import { BreederManagementApplicationStatusResultMapperService } from '../../../domain/services/breeder-management-application-status-result-mapper.service';

describe('브리더 입양 신청 상태 변경 유스케이스', () => {
    const breederManagementApplicationWorkflowPort = {
        findApplicationByIdAndBreeder: jest.fn(),
        updateStatus: jest.fn(),
        incrementCompletedAdoptions: jest.fn(),
        notifyApplicationStatusChanged: jest.fn(),
        recordApplicationApproval: jest.fn(),
        markPetAsAdopted: jest.fn(),
        rejectOtherOpenApplicationsForPet: jest.fn(),
        ensureChatRoomForApplication: jest.fn(),
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

    // 실제 v2 신청은 펫에 묶여 있다. 확정 후속 처리(펫 전이·다른 신청 거절)는 이 경우에만 돈다.
    const mockApplicationWithPet = {
        ...mockApplication,
        petId: { toString: () => 'pet-1' },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        breederManagementApplicationWorkflowPort.updateStatus.mockResolvedValue(undefined);
        breederManagementApplicationWorkflowPort.incrementCompletedAdoptions.mockResolvedValue(undefined);
        breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged.mockResolvedValue(undefined);
        breederManagementApplicationWorkflowPort.recordApplicationApproval.mockResolvedValue(undefined);
        breederManagementApplicationWorkflowPort.markPetAsAdopted.mockResolvedValue(undefined);
        breederManagementApplicationWorkflowPort.rejectOtherOpenApplicationsForPet.mockResolvedValue([]);
        breederManagementApplicationWorkflowPort.ensureChatRoomForApplication.mockResolvedValue(undefined);
    });

    const approve = (application: unknown = mockApplicationWithPet) => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(application);
        return useCase.execute('breeder-1', 'app-1', {
            applicationId: 'app-1',
            status: ApplicationStatus.ADOPTION_APPROVED,
        });
    };

    it('상담 완료 상태로 변경하면 알림을 발송한다', async () => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(mockApplication);
        breederManagementApplicationWorkflowPort.updateStatus.mockResolvedValue(undefined);
        breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', 'app-1', {
            applicationId: 'app-1',
            status: ApplicationStatus.CONSULTATION_COMPLETED,
        });

        expect(result.message).toBeDefined();
        expect(breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged).toHaveBeenCalledWith({
            breederId: 'breeder-1',
            adopterId: 'adopter-1',
            applicationId: 'app-1',
            status: ApplicationStatus.CONSULTATION_COMPLETED,
        });
        expect(breederManagementApplicationWorkflowPort.incrementCompletedAdoptions).not.toHaveBeenCalled();
    });

    it('입양 승인 상태로 변경하면 완료 입양 수를 증가시키고 알림을 발송한다', async () => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(mockApplication);
        breederManagementApplicationWorkflowPort.updateStatus.mockResolvedValue(undefined);
        breederManagementApplicationWorkflowPort.incrementCompletedAdoptions.mockResolvedValue(undefined);
        breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged.mockResolvedValue(undefined);

        await useCase.execute('breeder-1', 'app-1', {
            applicationId: 'app-1',
            status: ApplicationStatus.ADOPTION_APPROVED,
        });

        expect(breederManagementApplicationWorkflowPort.incrementCompletedAdoptions).toHaveBeenCalledWith('breeder-1');
        expect(breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged).toHaveBeenCalledWith({
            breederId: 'breeder-1',
            adopterId: 'adopter-1',
            applicationId: 'app-1',
            status: ApplicationStatus.ADOPTION_APPROVED,
        });
    });

    it('거절 상태로 변경하면 카운트 증가 없이 알림만 발송한다', async () => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(mockApplication);
        breederManagementApplicationWorkflowPort.updateStatus.mockResolvedValue(undefined);
        breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged.mockResolvedValue(undefined);

        await useCase.execute('breeder-1', 'app-1', {
            applicationId: 'app-1',
            status: ApplicationStatus.ADOPTION_REJECTED,
        });

        expect(breederManagementApplicationWorkflowPort.incrementCompletedAdoptions).not.toHaveBeenCalled();
        expect(breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged).toHaveBeenCalledWith({
            breederId: 'breeder-1',
            adopterId: 'adopter-1',
            applicationId: 'app-1',
            status: ApplicationStatus.ADOPTION_REJECTED,
        });
    });

    it('상담 대기 상태로 변경하면 알림을 발송하지 않는다', async () => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(mockApplication);
        breederManagementApplicationWorkflowPort.updateStatus.mockResolvedValue(undefined);

        await useCase.execute('breeder-1', 'app-1', {
            applicationId: 'app-1',
            status: ApplicationStatus.CONSULTATION_PENDING,
        });

        expect(breederManagementApplicationWorkflowPort.incrementCompletedAdoptions).not.toHaveBeenCalled();
        expect(breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged).not.toHaveBeenCalled();
    });

    it('입양 확정 시 펫을 분양완료로 전이하고 승인 시각을 같은 값으로 기록한다', async () => {
        await approve();

        expect(breederManagementApplicationWorkflowPort.markPetAsAdopted).toHaveBeenCalledWith(
            'pet-1',
            expect.any(Date),
        );
        expect(breederManagementApplicationWorkflowPort.recordApplicationApproval).toHaveBeenCalledWith(
            'app-1',
            expect.any(Date),
        );

        // 신청서의 approvedAt 과 펫의 adoptedAt 은 같은 시각이어야 한다.
        const approvedAt = breederManagementApplicationWorkflowPort.recordApplicationApproval.mock.calls[0][1];
        const adoptedAt = breederManagementApplicationWorkflowPort.markPetAsAdopted.mock.calls[0][1];
        expect(adoptedAt).toEqual(approvedAt);
    });

    it('입양 확정 시 같은 펫의 다른 대기 신청을 일괄 거절한다 (확정 본인 신청은 제외)', async () => {
        breederManagementApplicationWorkflowPort.rejectOtherOpenApplicationsForPet.mockResolvedValue([
            { applicationId: 'app-2', adopterId: 'adopter-2' },
        ]);

        await approve();

        expect(breederManagementApplicationWorkflowPort.rejectOtherOpenApplicationsForPet).toHaveBeenCalledWith(
            'pet-1',
            'app-1',
        );
    });

    it('자동 거절된 신청자에게도 진행 종료 알림을 보낸다 (조용히 닫히면 안 된다)', async () => {
        breederManagementApplicationWorkflowPort.rejectOtherOpenApplicationsForPet.mockResolvedValue([
            { applicationId: 'app-2', adopterId: 'adopter-2' },
            { applicationId: 'app-3', adopterId: 'adopter-3' },
        ]);

        await approve();

        expect(breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged).toHaveBeenCalledWith({
            breederId: 'breeder-1',
            adopterId: 'adopter-2',
            applicationId: 'app-2',
            status: ApplicationStatus.ADOPTION_REJECTED,
        });
        expect(breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged).toHaveBeenCalledWith({
            breederId: 'breeder-1',
            adopterId: 'adopter-3',
            applicationId: 'app-3',
            status: ApplicationStatus.ADOPTION_REJECTED,
        });
        // 확정 본인 알림 1건 + 자동 거절 2건
        expect(breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged).toHaveBeenCalledTimes(3);
    });

    it('자동 거절 대상이 없으면 추가 알림을 보내지 않는다', async () => {
        await approve();

        expect(breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged).toHaveBeenCalledTimes(1);
    });

    it('알림 발송이 실패해도 입양 확정을 되돌리지 않는다 (확정은 이미 끝난 뒤다)', async () => {
        breederManagementApplicationWorkflowPort.rejectOtherOpenApplicationsForPet.mockResolvedValue([
            { applicationId: 'app-2', adopterId: 'adopter-2' },
        ]);
        breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged.mockRejectedValue(
            new Error('mail server down'),
        );

        await expect(approve()).resolves.toBeDefined();
        expect(breederManagementApplicationWorkflowPort.markPetAsAdopted).toHaveBeenCalled();
        expect(mockLogger.logError).toHaveBeenCalled();
    });

    it('입양 확정 시 입양자-브리더 채팅방을 보장한다', async () => {
        await approve();

        expect(breederManagementApplicationWorkflowPort.ensureChatRoomForApplication).toHaveBeenCalledWith({
            breederId: 'breeder-1',
            adopterId: 'adopter-1',
            applicationId: 'app-1',
        });
    });

    it('펫이 연결되지 않은 신청은 펫 전이·일괄 거절을 건너뛰고 나머지는 그대로 처리한다', async () => {
        await approve(mockApplication);

        expect(breederManagementApplicationWorkflowPort.markPetAsAdopted).not.toHaveBeenCalled();
        expect(breederManagementApplicationWorkflowPort.rejectOtherOpenApplicationsForPet).not.toHaveBeenCalled();
        expect(breederManagementApplicationWorkflowPort.recordApplicationApproval).toHaveBeenCalled();
        expect(breederManagementApplicationWorkflowPort.ensureChatRoomForApplication).toHaveBeenCalled();
    });

    it.each([
        ApplicationStatus.CONSULTATION_PENDING,
        ApplicationStatus.CONSULTATION_COMPLETED,
        ApplicationStatus.ADOPTION_REJECTED,
    ])('확정이 아닌 전이(%s)는 펫 상태와 다른 신청을 건드리지 않는다', async (status) => {
        breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue(
            mockApplicationWithPet,
        );

        await useCase.execute('breeder-1', 'app-1', { applicationId: 'app-1', status });

        expect(breederManagementApplicationWorkflowPort.markPetAsAdopted).not.toHaveBeenCalled();
        expect(breederManagementApplicationWorkflowPort.rejectOtherOpenApplicationsForPet).not.toHaveBeenCalled();
        expect(breederManagementApplicationWorkflowPort.recordApplicationApproval).not.toHaveBeenCalled();
        expect(breederManagementApplicationWorkflowPort.ensureChatRoomForApplication).not.toHaveBeenCalled();
    });

    describe('상태 전이 가드', () => {
        const withStatus = (status: ApplicationStatus) => {
            breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder.mockResolvedValue({
                ...mockApplicationWithPet,
                status,
            });
        };

        const run = (status: ApplicationStatus) =>
            useCase.execute('breeder-1', 'app-1', { applicationId: 'app-1', status });

        // 낡은 화면에서 온 재확정이 여기서 걸린다 — 막지 않으면 한 펫에 확정 신청이 두 건 생기고
        // 브리더 실적(completedAdoptions)도 두 번 오른다.
        it.each([
            [ApplicationStatus.ADOPTION_REJECTED, ApplicationStatus.ADOPTION_APPROVED],
            [ApplicationStatus.ADOPTION_APPROVED, ApplicationStatus.ADOPTION_REJECTED],
            [ApplicationStatus.ADOPTION_APPROVED, ApplicationStatus.CONSULTATION_COMPLETED],
            [ApplicationStatus.ADOPTION_REJECTED, ApplicationStatus.CONSULTATION_COMPLETED],
            [ApplicationStatus.CONSULTATION_COMPLETED, ApplicationStatus.CONSULTATION_PENDING],
        ])('%s → %s 는 409 로 막고 아무것도 바꾸지 않는다', async (current, next) => {
            withStatus(current);

            await expect(run(next)).rejects.toThrow(DomainConflictError);

            expect(breederManagementApplicationWorkflowPort.updateStatus).not.toHaveBeenCalled();
            expect(breederManagementApplicationWorkflowPort.incrementCompletedAdoptions).not.toHaveBeenCalled();
            expect(breederManagementApplicationWorkflowPort.markPetAsAdopted).not.toHaveBeenCalled();
            expect(breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged).not.toHaveBeenCalled();
        });

        it.each([
            [ApplicationStatus.CONSULTATION_PENDING, ApplicationStatus.CONSULTATION_COMPLETED],
            [ApplicationStatus.CONSULTATION_PENDING, ApplicationStatus.ADOPTION_REJECTED],
            [ApplicationStatus.CONSULTATION_COMPLETED, ApplicationStatus.ADOPTION_APPROVED],
            [ApplicationStatus.CONSULTATION_COMPLETED, ApplicationStatus.ADOPTION_REJECTED],
        ])('%s → %s 는 그대로 통과한다', async (current, next) => {
            withStatus(current);

            await expect(run(next)).resolves.toBeDefined();
            expect(breederManagementApplicationWorkflowPort.updateStatus).toHaveBeenCalledWith('app-1', next);
        });

        // 버튼 두 번 누름·재시도. 실패로 보이면 안 되지만, 알림·실적이 두 번 나가도 안 된다.
        it.each([
            ApplicationStatus.CONSULTATION_PENDING,
            ApplicationStatus.CONSULTATION_COMPLETED,
            ApplicationStatus.ADOPTION_APPROVED,
            ApplicationStatus.ADOPTION_REJECTED,
        ])('같은 상태(%s)로의 재요청은 성공하되 아무 부수효과도 내지 않는다', async (status) => {
            withStatus(status);

            await expect(run(status)).resolves.toBeDefined();

            expect(breederManagementApplicationWorkflowPort.updateStatus).not.toHaveBeenCalled();
            expect(breederManagementApplicationWorkflowPort.incrementCompletedAdoptions).not.toHaveBeenCalled();
            expect(breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged).not.toHaveBeenCalled();
        });
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
