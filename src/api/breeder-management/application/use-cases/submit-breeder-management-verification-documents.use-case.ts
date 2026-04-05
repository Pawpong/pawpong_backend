import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { VerificationStatus } from '../../../../common/enum/user.enum';
import { BREEDER_MANAGEMENT_FILE_URL_PORT } from '../ports/breeder-management-file-url.port';
import type { BreederManagementFileUrlPort } from '../ports/breeder-management-file-url.port';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_SETTINGS_PORT } from '../ports/breeder-management-settings.port';
import type { BreederManagementSettingsPort } from '../ports/breeder-management-settings.port';
import { BreederManagementVerificationDraftStorePort } from '../ports/breeder-management-verification-draft-store.port';
import { BreederManagementVerificationNotifierPort } from '../ports/breeder-management-verification-notifier.port';
import { SubmitDocumentsRequestDto } from '../../dto/request/submit-documents-request.dto';
import { BreederManagementVerificationDocumentPolicyService } from '../../domain/services/breeder-management-verification-document-policy.service';
import { BreederManagementVerificationNotificationPayloadFactoryService } from '../../domain/services/breeder-management-verification-notification-payload-factory.service';

@Injectable()
export class SubmitBreederManagementVerificationDocumentsUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        @Inject(BREEDER_MANAGEMENT_SETTINGS_PORT)
        private readonly breederManagementSettingsPort: BreederManagementSettingsPort,
        @Inject(BREEDER_MANAGEMENT_FILE_URL_PORT)
        private readonly breederManagementFileUrlPort: BreederManagementFileUrlPort,
        private readonly breederManagementVerificationDraftStorePort: BreederManagementVerificationDraftStorePort,
        private readonly breederManagementVerificationNotifierPort: BreederManagementVerificationNotifierPort,
        private readonly breederManagementVerificationDocumentPolicyService: BreederManagementVerificationDocumentPolicyService,
        private readonly breederManagementVerificationNotificationPayloadFactoryService: BreederManagementVerificationNotificationPayloadFactoryService,
    ) {}

    async execute(userId: string, dto: SubmitDocumentsRequestDto): Promise<{ message: string }> {
        const breeder = await this.breederManagementProfilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        if (breeder.verification?.status === VerificationStatus.APPROVED) {
            throw new BadRequestException('이미 인증이 완료된 브리더입니다.');
        }

        const draftDocuments = await this.breederManagementVerificationDraftStorePort.get(userId);
        const submissionPlan = this.breederManagementVerificationDocumentPolicyService.buildSubmissionPlan({
            level: dto.level,
            submittedDocuments: dto.documents,
            draftDocuments,
            currentVerification: breeder.verification,
        });

        await this.breederManagementSettingsPort.updateVerification(userId, {
            status: VerificationStatus.REVIEWING,
            level: dto.level,
            submittedAt: submissionPlan.submittedAt,
            documents: submissionPlan.finalDocuments,
            submittedByEmail: dto.submittedByEmail || false,
        });

        await this.breederManagementVerificationNotifierPort.notifySubmission(
            this.breederManagementVerificationNotificationPayloadFactoryService.create({
                breeder,
                level: dto.level,
                isResubmission: submissionPlan.isResubmission,
                submittedAt: submissionPlan.submittedAt,
                finalDocuments: submissionPlan.finalDocuments,
                draftDocuments,
                fileUrlPort: this.breederManagementFileUrlPort,
            }),
        );

        await this.breederManagementVerificationDraftStorePort.delete(userId);

        return { message: '입점 서류 제출이 완료되었습니다. 관리자 검토 후 결과를 알려드립니다.' };
    }
}
