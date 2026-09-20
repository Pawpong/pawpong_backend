import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
    OPS_PENDING_CREATED_EVENT,
    OPS_PENDING_KIND,
    type OpsPendingCreatedEvent,
} from '../../../../../common/events/ops-pending.event';

import { VerificationStatus } from '../../../../../common/enum/user.enum';
import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { BREEDER_MANAGEMENT_FILE_URL_PORT } from '../ports/breeder-management-file-url.port';
import type { BreederManagementFileUrlPort } from '../ports/breeder-management-file-url.port';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_SETTINGS_PORT } from '../ports/breeder-management-settings.port';
import type { BreederManagementSettingsPort } from '../ports/breeder-management-settings.port';
import {
    BREEDER_MANAGEMENT_VERIFICATION_DRAFT_STORE_PORT,
    type BreederManagementVerificationDraftStorePort,
} from '../ports/breeder-management-verification-draft-store.port';
import {
    BREEDER_MANAGEMENT_VERIFICATION_NOTIFIER_PORT,
    type BreederManagementVerificationNotifierPort,
} from '../ports/breeder-management-verification-notifier.port';
import { BreederManagementVerificationCommandResultMapperService } from '../../domain/services/breeder-management-verification-command-result-mapper.service';
import { BreederManagementVerificationDocumentPolicyService } from '../../domain/services/breeder-management-verification-document-policy.service';
import { BreederManagementVerificationNotificationPayloadFactoryService } from '../../domain/services/breeder-management-verification-notification-payload-factory.service';
import type { BreederManagementVerificationDocumentsSubmitCommand } from '../types/breeder-management-verification-command.type';

@Injectable()
export class SubmitBreederManagementVerificationDocumentsUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        @Inject(BREEDER_MANAGEMENT_SETTINGS_PORT)
        private readonly breederManagementSettingsPort: BreederManagementSettingsPort,
        @Inject(BREEDER_MANAGEMENT_FILE_URL_PORT)
        private readonly breederManagementFileUrlPort: BreederManagementFileUrlPort,
        @Inject(BREEDER_MANAGEMENT_VERIFICATION_DRAFT_STORE_PORT)
        private readonly breederManagementVerificationDraftStorePort: BreederManagementVerificationDraftStorePort,
        @Inject(BREEDER_MANAGEMENT_VERIFICATION_NOTIFIER_PORT)
        private readonly breederManagementVerificationNotifierPort: BreederManagementVerificationNotifierPort,
        private readonly breederManagementVerificationCommandResultMapperService: BreederManagementVerificationCommandResultMapperService,
        private readonly breederManagementVerificationDocumentPolicyService: BreederManagementVerificationDocumentPolicyService,
        private readonly breederManagementVerificationNotificationPayloadFactoryService: BreederManagementVerificationNotificationPayloadFactoryService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async execute(
        userId: string,
        dto: BreederManagementVerificationDocumentsSubmitCommand,
    ): Promise<{ message: string }> {
        const breeder = await this.breederManagementProfilePort.findById(userId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더 정보를 찾을 수 없습니다.');
        }

        if (breeder.verification?.status === VerificationStatus.APPROVED) {
            throw new DomainValidationError('이미 인증이 완료된 브리더입니다.');
        }

        const draftDocuments = await this.breederManagementVerificationDraftStorePort.get(userId);
        const submissionPlan = this.breederManagementVerificationDocumentPolicyService.buildSubmissionPlan({
            submittedDocuments: dto.documents,
            draftDocuments,
            currentVerification: breeder.verification,
        });

        await this.breederManagementSettingsPort.updateVerification(userId, {
            status: VerificationStatus.REVIEWING,
            submittedAt: submissionPlan.submittedAt,
            documents: submissionPlan.finalDocuments,
            submittedByEmail: dto.submittedByEmail || false,
        });

        await this.breederManagementVerificationNotifierPort.notifySubmission(
            this.breederManagementVerificationNotificationPayloadFactoryService.create({
                breeder,
                isResubmission: submissionPlan.isResubmission,
                submittedAt: submissionPlan.submittedAt,
                finalDocuments: submissionPlan.finalDocuments,
                draftDocuments,
                fileUrlPort: this.breederManagementFileUrlPort,
            }),
        );

        await this.breederManagementVerificationDraftStorePort.delete(userId);

        // 심사가 밀리면 브리더가 이탈한다. 승인/거절 전까지 운영 대기로 올려 리마인드를 받는다.
        const opsEvent: OpsPendingCreatedEvent = {
            kind: OPS_PENDING_KIND.BREEDER_VERIFICATION,
            referenceId: userId,
            summary: submissionPlan.isResubmission
                ? '브리더가 인증 서류를 재제출했습니다. 심사가 필요합니다.'
                : '브리더가 인증 서류를 제출했습니다. 심사가 필요합니다.',
            details: [
                { name: '브리더 ID', value: userId },
                { name: '서류 수', value: String(submissionPlan.finalDocuments.length) },
                { name: '재제출 여부', value: submissionPlan.isResubmission ? '재제출' : '최초 제출' },
            ],
        };
        await this.eventEmitter.emitAsync(OPS_PENDING_CREATED_EVENT, opsEvent);

        return this.breederManagementVerificationCommandResultMapperService.toVerificationDocumentsSubmittedResult();
    }
}
