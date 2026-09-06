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
        }

        this.logger.log(
            `[updateApplicationStatus] 상담 완료 체크: ${updateData.status} === ${ApplicationStatus.CONSULTATION_COMPLETED} ? ${updateData.status === ApplicationStatus.CONSULTATION_COMPLETED}`,
        );

        if (updateData.status === ApplicationStatus.CONSULTATION_COMPLETED) {
            this.logger.log('[updateApplicationStatus] 상담 완료 알림 발송 시작');
            await this.breederManagementApplicationWorkflowPort.notifyConsultationCompleted({
                breederId: userId,
                adopterId: application.adopterId.toString(),
                applicationId,
            });
        }

        return this.breederManagementApplicationStatusResultMapperService.toApplicationStatusUpdatedResult();
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
