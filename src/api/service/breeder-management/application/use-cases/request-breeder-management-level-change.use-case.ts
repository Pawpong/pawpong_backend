import { Inject, Injectable } from '@nestjs/common';

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
import type { BreederManagementLevelChangeRequestCommand } from '../types/breeder-management-verification-command.type';
import { BreederManagementVerificationCommandResultMapperService } from '../../domain/services/breeder-management-verification-command-result-mapper.service';
import { BreederManagementVerificationDocumentPolicyService } from '../../domain/services/breeder-management-verification-document-policy.service';
import { BreederManagementVerificationNotificationPayloadFactoryService } from '../../domain/services/breeder-management-verification-notification-payload-factory.service';

@Injectable()
export class RequestBreederManagementLevelChangeUseCase {
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
    ) {}

    async execute(userId: string, dto: BreederManagementLevelChangeRequestCommand): Promise<{ message: string }> {
        const breeder = await this.breederManagementProfilePort.findById(userId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더 정보를 찾을 수 없습니다.');
        }

        if (breeder.verification?.status !== VerificationStatus.APPROVED) {
            throw new DomainValidationError('승인된 브리더만 등급 변경을 신청할 수 있습니다.');
        }

        const currentLevel = breeder.verification.level || 'new';
        if (currentLevel !== 'new' || dto.requestedLevel !== 'elite') {
            throw new DomainValidationError('New 브리더만 Elite 등급 심사를 신청할 수 있습니다.');
        }

        if (breeder.verification.isLevelChangeRequested) {
            throw new DomainValidationError('이미 등급 변경 심사가 진행 중입니다.');
        }

        const draftDocuments = await this.breederManagementVerificationDraftStorePort.get(userId);
        const submissionPlan = this.breederManagementVerificationDocumentPolicyService.buildSubmissionPlan({
            level: dto.requestedLevel,
            submittedDocuments: dto.documents,
            draftDocuments,
            currentVerification: breeder.verification,
        });

        await this.breederManagementSettingsPort.requestLevelChange(userId, {
            previousLevel: currentLevel,
            requestedLevel: dto.requestedLevel,
            requestedAt: submissionPlan.submittedAt,
            documents: submissionPlan.finalDocuments,
        });

        await this.breederManagementVerificationNotifierPort.notifySubmission(
            this.breederManagementVerificationNotificationPayloadFactoryService.create({
                breeder,
                level: dto.requestedLevel,
                isResubmission: false,
                submissionKind: 'level_change',
                submittedAt: submissionPlan.submittedAt,
                finalDocuments: submissionPlan.finalDocuments,
                draftDocuments,
                fileUrlPort: this.breederManagementFileUrlPort,
            }),
        );

        await this.breederManagementVerificationDraftStorePort.delete(userId);

        return this.breederManagementVerificationCommandResultMapperService.toLevelChangeRequestedResult();
    }
}
