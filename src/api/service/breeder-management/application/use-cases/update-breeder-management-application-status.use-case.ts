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
            await this.breederManagementApplicationWorkflowPort.incrementCompletedAdoptions(userId);
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
}
