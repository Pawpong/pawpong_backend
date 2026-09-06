import { Inject, Injectable } from '@nestjs/common';

import { ApplicationStatus } from '../../../../../common/enum/user.enum';
import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT } from '../ports/breeder-management-application-workflow.port';
import type { BreederManagementApplicationWorkflowPort } from '../ports/breeder-management-application-workflow.port';
import { BreederManagementApplicationStatusResultMapperService } from '../../domain/services/breeder-management-application-status-result-mapper.service';
import type { BreederManagementApplicationStatusUpdateCommand } from '../types/breeder-management-application-command.type';

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
            await this.breederManagementApplicationWorkflowPort.notifyApplicationStatusChanged({
                breederId: userId,
                adopterId: application.adopterId.toString(),
                applicationId,
                status: updateData.status,
            });
        }

        return this.breederManagementApplicationStatusResultMapperService.toApplicationStatusUpdatedResult();
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
            const rejectedCount = await this.breederManagementApplicationWorkflowPort.rejectOtherOpenApplicationsForPet(
                petId,
                applicationId,
            );
            this.logger.log(
                `[updateApplicationStatus] 펫 분양완료 전이 및 다른 대기 신청 ${rejectedCount}건 자동 거절 (petId: ${petId})`,
            );
        }

        await this.breederManagementApplicationWorkflowPort.incrementCompletedAdoptions(breederId);

        await this.breederManagementApplicationWorkflowPort.ensureChatRoomForApplication({
            breederId,
            adopterId: application.adopterId.toString(),
            applicationId,
        });
    }
}
