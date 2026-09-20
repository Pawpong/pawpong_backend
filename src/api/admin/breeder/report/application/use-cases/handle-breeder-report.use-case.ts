import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
    OPS_PENDING_KIND,
    OPS_PENDING_RESOLVED_EVENT,
    type OpsPendingResolvedEvent,
} from '../../../../../../common/events/ops-pending.event';

import { BREEDER_REPORT_ADMIN_READER_PORT } from '../ports/breeder-report-admin-reader.port';
import { BREEDER_REPORT_ADMIN_WRITER_PORT } from '../ports/breeder-report-admin-writer.port';
import type { BreederReportAdminReaderPort } from '../ports/breeder-report-admin-reader.port';
import type { BreederReportAdminWriterPort } from '../ports/breeder-report-admin-writer.port';
import { BreederReportAdminPolicyService } from '../../domain/services/breeder-report-admin-policy.service';
import { BreederReportAdminActivityLogFactoryService } from '../../domain/services/breeder-report-admin-activity-log-factory.service';
import { BreederReportAdminActionResultMapperService } from '../../domain/services/breeder-report-admin-action-result-mapper.service';
import type { BreederReportActionCommand } from '../types/breeder-report-admin-command.type';
import type { BreederReportAdminActionResult } from '../types/breeder-report-admin-result.type';

@Injectable()
export class HandleBreederReportUseCase {
    constructor(
        @Inject(BREEDER_REPORT_ADMIN_READER_PORT)
        private readonly breederReportAdminReader: BreederReportAdminReaderPort,
        @Inject(BREEDER_REPORT_ADMIN_WRITER_PORT)
        private readonly breederReportAdminWriter: BreederReportAdminWriterPort,
        private readonly breederReportAdminPolicyService: BreederReportAdminPolicyService,
        private readonly breederReportAdminActivityLogFactoryService: BreederReportAdminActivityLogFactoryService,
        private readonly breederReportAdminActionResultMapperService: BreederReportAdminActionResultMapperService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async execute(
        adminId: string,
        reportId: string,
        actionData: BreederReportActionCommand,
    ): Promise<BreederReportAdminActionResult> {
        this.breederReportAdminPolicyService.assertCanManageBreeders(
            await this.breederReportAdminReader.findAdminById(adminId),
        );

        const report = this.breederReportAdminPolicyService.assertPendingReport(
            this.breederReportAdminPolicyService.assertReportExists(
                await this.breederReportAdminReader.findReportById(reportId),
            ),
        );

        const status = this.breederReportAdminPolicyService.resolveReportStatus(actionData.action);
        const processedAt = new Date();

        await this.breederReportAdminWriter.updateReport(report.breederId, reportId, {
            status,
            adminNotes: actionData.adminNotes,
            suspensionReason:
                actionData.action === 'resolve'
                    ? this.breederReportAdminPolicyService.createSuspensionReason(actionData.adminNotes)
                    : undefined,
            suspendedAt: actionData.action === 'resolve' ? processedAt : undefined,
        });

        await this.breederReportAdminWriter.appendAdminActivityLog(
            adminId,
            this.breederReportAdminActivityLogFactoryService.create(
                this.breederReportAdminPolicyService.resolveAdminAction(actionData.action),
                report.breederId,
                this.breederReportAdminPolicyService.getBreederDisplayName(report),
                this.breederReportAdminPolicyService.createActivityDescription(
                    actionData.action,
                    actionData.adminNotes,
                ),
            ),
        );

        // 처리된 건은 리마인드를 멈춘다. 처리했는데 독촉이 계속 오면 알림을 무시하게 된다.
        const opsResolved: OpsPendingResolvedEvent = {
            kind: OPS_PENDING_KIND.BREEDER_REPORT,
            referenceId: reportId,
            resolution: actionData.action,
        };
        await this.eventEmitter.emitAsync(OPS_PENDING_RESOLVED_EVENT, opsResolved);

        return this.breederReportAdminActionResultMapperService.toResult(
            reportId,
            report.breederId,
            actionData.action,
            status,
            actionData.adminNotes,
            processedAt,
        );
    }
}
