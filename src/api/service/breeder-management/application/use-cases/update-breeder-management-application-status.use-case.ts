import { Inject, Injectable } from '@nestjs/common';

import { ApplicationStatus } from '../../../../../common/enum/user.enum';
import { DomainConflictError, DomainNotFoundError } from '../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT } from '../ports/breeder-management-application-workflow.port';
import type {
    BreederManagementApplicationStatusNotificationCommand,
    BreederManagementApplicationWorkflowPort,
    BreederManagementRejectedApplication,
} from '../ports/breeder-management-application-workflow.port';
import { BreederManagementApplicationStatusResultMapperService } from '../../domain/services/breeder-management-application-status-result-mapper.service';
import type { BreederManagementApplicationStatusUpdateCommand } from '../types/breeder-management-application-command.type';

/**
 * 현재 상태에서 넘어갈 수 있는 상태 목록.
 *
 * 확정·거절은 종착점이라 어디로도 나가지 못한다 — 화면이 낡은 채로 남아 있을 때가 문제다.
 * 예: 같은 펫의 다른 신청을 확정하면 이 신청은 자동 거절되는데, 그 전에 열어둔 탭은 여전히
 * '입양 확정' 버튼을 들고 있다. 가드가 없으면 그 버튼이 그대로 먹혀서 한 펫에 확정 신청이
 * 두 건 생기고 브리더 실적(completedAdoptions)도 두 번 올라간다.
 *
 * 상담완료 → 상담대기 같은 역주행도 막는다. 펫 예약이 신청서에서 재계산되는 구조라
 * 상태만 슬쩍 되돌아가면 예약중인 펫에 근거가 사라진다.
 *
 * 같은 상태로의 재요청은 이 표를 타지 않고 멱등 무시한다(아래 execute 참고).
 */
const ALLOWED_STATUS_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
    [ApplicationStatus.CONSULTATION_PENDING]: [
        ApplicationStatus.CONSULTATION_COMPLETED,
        ApplicationStatus.ADOPTION_APPROVED,
        ApplicationStatus.ADOPTION_REJECTED,
    ],
    [ApplicationStatus.CONSULTATION_COMPLETED]: [
        ApplicationStatus.ADOPTION_APPROVED,
        ApplicationStatus.ADOPTION_REJECTED,
    ],
    [ApplicationStatus.ADOPTION_APPROVED]: [],
    [ApplicationStatus.ADOPTION_REJECTED]: [],
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
    [ApplicationStatus.CONSULTATION_PENDING]: '상담 대기',
    [ApplicationStatus.CONSULTATION_COMPLETED]: '상담 완료',
    [ApplicationStatus.ADOPTION_APPROVED]: '입양 확정',
    [ApplicationStatus.ADOPTION_REJECTED]: '진행 종료',
};

@Injectable()
export class UpdateBreederManagementApplicationStatusUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT)
        private readonly breederManagementApplicationWorkflowPort: BreederManagementApplicationWorkflowPort,
        private readonly breederManagementApplicationStatusResultMapperService: BreederManagementApplicationStatusResultMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(userId: string, applicationId: string, updateData: BreederManagementApplicationStatusUpdateCommand) {
        this.logger.logStart('updateApplicationStatus', '입양 신청 상태 업데이트 시작', {
            userId,
            applicationId,
            newStatus: updateData.status,
        });

        const application = await this.breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder(
            applicationId,
            userId,
        );

        if (!application) {
            throw new DomainNotFoundError('해당 입양 신청을 찾을 수 없습니다.');
        }

        this.logger.log(
            `[updateApplicationStatus] 현재 상태: ${application.status} → 변경할 상태: ${updateData.status}`,
        );

        const currentStatus = application.status as ApplicationStatus;

        // 같은 상태로의 재요청은 성공으로 흘린다 — 버튼 두 번 누름·재시도가 실패로 보이면 안 되고,
        // 여기서 막지 않으면 알림·메일이 한 번 더 나가고 확정이면 실적까지 두 번 오른다.
        if (currentStatus === updateData.status) {
            this.logger.log(`[updateApplicationStatus] 이미 ${updateData.status} 상태라 변경 없이 종료`);
            return this.breederManagementApplicationStatusResultMapperService.toApplicationStatusUpdatedResult();
        }

        this.assertTransitionAllowed(currentStatus, updateData.status);

        await this.breederManagementApplicationWorkflowPort.updateStatus(applicationId, updateData.status);

        if (updateData.status === ApplicationStatus.ADOPTION_APPROVED) {
            await this.finalizeAdoption(userId, applicationId, application);
        } else {
            await this.syncPetReservation(application);
        }

        // 대기 상태로 되돌아가는 경우는 없으니, 나머지 세 상태는 전부 입양자에게 알린다
        // (상담완료/입양확정/거절 — 해당 상태에 알림 문구가 없으면 어댑터가 조용히 건너뛴다)
        if (updateData.status !== ApplicationStatus.CONSULTATION_PENDING) {
            this.logger.log(`[updateApplicationStatus] 상태 변경 알림 발송 시작: ${updateData.status}`);
            await this.notifySafely({
                breederId: userId,
                adopterId: application.adopterId.toString(),
                applicationId,
                status: updateData.status,
            });
        }

        return this.breederManagementApplicationStatusResultMapperService.toApplicationStatusUpdatedResult();
    }

    /**
     * 알림 한 건을 보내되 실패를 삼킨다.
     *
     * 여기까지 왔으면 상태 전이·펫 전이·다른 신청 거절이 전부 끝난 뒤다. 알림이 터졌다고 예외를
     * 올리면 이미 확정된 입양이 500 으로 보이고, 브리더가 다시 누르면 이번엔 전이 가드에 409 로
     * 막혀 더 헷갈린다. 예약 동기화·채팅방 보장과 같은 이유로 로깅만 한다.
     */
    private async notifySafely(command: BreederManagementApplicationStatusNotificationCommand): Promise<void> {
        try {
            await this.breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged(command);
        } catch (error) {
            this.logger.logError('updateApplicationStatus', '신청 상태 변경 알림 발송 실패', error);
        }
    }

    /**
     * 허용되지 않은 상태 전이를 409 로 막는다.
     *
     * 화면이 낡았을 때만 도달하는 경로라 사용자에게는 "지금 화면이 실제와 다르다"는 사실이 중요하다.
     * 그래서 메시지에 현재 상태를 담아, 프론트가 그대로 띄우면 왜 막혔는지 바로 읽히게 한다.
     */
    private assertTransitionAllowed(currentStatus: ApplicationStatus, nextStatus: ApplicationStatus): void {
        if (ALLOWED_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus)) return;

        throw new DomainConflictError(
            `이미 '${STATUS_LABEL[currentStatus]}' 로 처리된 신청이라 '${STATUS_LABEL[nextStatus]}' 로 변경할 수 없습니다.`,
            'APPLICATION_STATUS_TRANSITION_NOT_ALLOWED',
        );
    }

    /**
     * 확정 외 전이(상담완료·거절) 후 펫의 예약 상태를 신청서 기준으로 다시 맞춘다.
     *
     * 상담완료는 브리더가 "이 사람으로 진행한다"고 정한 확정 직전 단계이므로, 그 시점에 펫을
     * 예약중으로 바꿔 다른 사람의 신규 신청을 막는다(findApplicablePet 이 status='available' 만 받는다).
     * 반대로 그 신청이 거절되면 다시 분양중으로 풀어야 한다 — 걸기만 하고 푸는 길이 없으면
     * 펫이 영영 잠긴다. 한 펫에 상담완료가 여러 건 있을 수 있어 "거절했으니 무조건 해제" 는
     * 틀리므로, 전이를 지시하지 않고 어댑터가 신청서에서 매번 다시 계산하게 한다.
     *
     * 펫이 연결되지 않은 신청(v1 은 petId 없이 신청 가능)은 건너뛴다.
     * 예약 동기화 실패가 상태 전이 자체를 되돌리면 안 되므로 예외는 로깅만 하고 삼킨다.
     */
    private async syncPetReservation(application: { petId?: { toString(): string } | null }): Promise<void> {
        const petId = application.petId?.toString();
        if (!petId) return;

        try {
            const synced =
                await this.breederManagementApplicationWorkflowPort.syncPetReservationFromApplications(petId);
            this.logger.log(`[updateApplicationStatus] 펫 예약 상태 동기화: ${synced} (petId: ${petId})`);
        } catch (error) {
            this.logger.logError('updateApplicationStatus', '펫 예약 상태 동기화 실패', error);
        }
    }

    /**
     * 입양 확정 후속 처리.
     * 신청서 상태 전이(updateStatus)만으로는 아무 일도 일어나지 않으므로, 확정 시점에
     * 승인 시각 기록 → 펫 분양완료 전이 → 같은 펫의 다른 대기 신청 일괄 거절 → 브리더 실적 증가 →
     * 채팅방 보장까지 한 번에 마무리한다.
     *
     * 펫이 연결되지 않은 신청(v1 은 petId 없이 신청 가능)은 펫 관련 단계를 건너뛴다.
     * 채팅방 보장은 실패해도 확정을 되돌리지 않는다(포트 구현체가 예외를 삼킨다).
     */
    private async finalizeAdoption(
        breederId: string,
        applicationId: string,
        application: { adopterId: { toString(): string }; petId?: { toString(): string } | null },
    ): Promise<void> {
        const approvedAt = new Date();
        await this.breederManagementApplicationWorkflowPort.recordApplicationApproval(applicationId, approvedAt);

        const petId = application.petId?.toString();
        if (petId) {
            await this.breederManagementApplicationWorkflowPort.markPetAsAdopted(petId, approvedAt);
            const rejected = await this.breederManagementApplicationWorkflowPort.rejectOtherOpenApplicationsForPet(
                petId,
                applicationId,
            );
            this.logger.log(
                `[updateApplicationStatus] 펫 분양완료 전이 및 다른 대기 신청 ${rejected.length}건 자동 거절 (petId: ${petId})`,
            );
            await this.notifyAutoRejectedApplicants(breederId, rejected);
        }

        await this.breederManagementApplicationWorkflowPort.incrementCompletedAdoptions(breederId);

        await this.breederManagementApplicationWorkflowPort.ensureChatRoomForApplication({
            breederId,
            adopterId: application.adopterId.toString(),
            applicationId,
        });
    }

    /**
     * 확정 때문에 자동 거절된 신청자들에게도 "진행 종료" 알림을 보낸다.
     *
     * 예전엔 상태만 조용히 바뀌어서, 떨어진 사람은 신청 목록에 직접 들어가 봐야 결과를 알았다.
     * 직접 거절당한 사람과 같은 문구·같은 경로를 쓴다(어댑터의 ADOPTION_REJECTED 문구 재사용).
     *
     * 확정 한 번에 N건이 나가므로 순차로 기다리지 않고 병렬로 던진다 — 브리더 쪽 '입양 확정'
     * 응답이 신청자 수만큼 느려지면 안 된다. 실패는 notifySafely 가 건별로 삼키므로 한 사람에게
     * 못 보냈다고 나머지가 통째로 날아가지 않는다.
     */
    private async notifyAutoRejectedApplicants(
        breederId: string,
        rejected: BreederManagementRejectedApplication[],
    ): Promise<void> {
        if (rejected.length === 0) return;

        await Promise.all(
            rejected.map((application) =>
                this.notifySafely({
                    breederId,
                    adopterId: application.adopterId,
                    applicationId: application.applicationId,
                    status: ApplicationStatus.ADOPTION_REJECTED,
                }),
            ),
        );
        this.logger.logSuccess('updateApplicationStatus', '자동 거절 신청자 알림 발송 완료', {
            count: rejected.length,
        });
    }
}
