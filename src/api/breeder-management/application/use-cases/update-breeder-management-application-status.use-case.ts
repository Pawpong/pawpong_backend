import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ApplicationStatus } from '../../../../common/enum/user.enum';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT } from '../ports/breeder-management-application-workflow.port';
import type { BreederManagementApplicationWorkflowPort } from '../ports/breeder-management-application-workflow.port';
import { BreederManagementApplicationStatusResponseService } from '../../domain/services/breeder-management-application-status-response.service';
import type { BreederManagementApplicationStatusUpdateCommand } from '../types/breeder-management-application-command.type';

@Injectable()
export class UpdateBreederManagementApplicationStatusUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT)
        private readonly breederManagementApplicationWorkflowPort: BreederManagementApplicationWorkflowPort,
        private readonly breederManagementApplicationStatusResponseService: BreederManagementApplicationStatusResponseService,
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
            throw new BadRequestException('해당 입양 신청을 찾을 수 없습니다.');
        }

        this.logger.log(
            `[updateApplicationStatus] 현재 상태: ${application.status} → 변경할 상태: ${updateData.status}`,
        );

        await this.breederManagementApplicationWorkflowPort.updateStatus(applicationId, updateData.status);

        if (updateData.status === ApplicationStatus.ADOPTION_APPROVED) {
            await this.breederManagementApplicationWorkflowPort.incrementCompletedAdoptions(userId);
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

        return this.breederManagementApplicationStatusResponseService.createApplicationStatusUpdated();
    }
}
