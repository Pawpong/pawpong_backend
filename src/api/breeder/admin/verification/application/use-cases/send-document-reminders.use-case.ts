import { Inject, Injectable, Logger } from '@nestjs/common';

import { AdminAction, AdminTargetType } from '../../../../../../common/enum/user.enum';
import { getErrorMessage } from '../../../../../../common/utils/error.util';
import { BREEDER_VERIFICATION_ADMIN_READER } from '../ports/breeder-verification-admin-reader.port';
import { BREEDER_VERIFICATION_ADMIN_WRITER } from '../ports/breeder-verification-admin-writer.port';
import { BREEDER_VERIFICATION_ADMIN_NOTIFIER } from '../ports/breeder-verification-admin-notifier.port';
import type { BreederVerificationAdminReaderPort } from '../ports/breeder-verification-admin-reader.port';
import type { BreederVerificationAdminWriterPort } from '../ports/breeder-verification-admin-writer.port';
import type { BreederVerificationAdminNotifierPort } from '../ports/breeder-verification-admin-notifier.port';
import { BreederVerificationAdminActivityLogFactoryService } from '../../domain/services/breeder-verification-admin-activity-log-factory.service';
import { BreederVerificationAdminCommandResponseService } from '../../domain/services/breeder-verification-admin-command-response.service';
import { BreederVerificationAdminPolicyService } from '../../domain/services/breeder-verification-admin-policy.service';

@Injectable()
export class SendDocumentRemindersUseCase {
    private readonly logger = new Logger(SendDocumentRemindersUseCase.name);

    constructor(
        @Inject(BREEDER_VERIFICATION_ADMIN_READER)
        private readonly breederVerificationAdminReader: BreederVerificationAdminReaderPort,
        @Inject(BREEDER_VERIFICATION_ADMIN_WRITER)
        private readonly breederVerificationAdminWriter: BreederVerificationAdminWriterPort,
        @Inject(BREEDER_VERIFICATION_ADMIN_NOTIFIER)
        private readonly breederVerificationAdminNotifier: BreederVerificationAdminNotifierPort,
        private readonly breederVerificationAdminPolicyService: BreederVerificationAdminPolicyService,
        private readonly breederVerificationAdminActivityLogFactoryService: BreederVerificationAdminActivityLogFactoryService,
        private readonly breederVerificationAdminCommandResponseService: BreederVerificationAdminCommandResponseService,
    ) {}

    async execute(adminId: string): Promise<{ sentCount: number; breederIds: string[] }> {
        this.breederVerificationAdminPolicyService.assertCanManageBreeders(
            await this.breederVerificationAdminReader.findAdminById(adminId),
            '브리더 관리 권한이 없습니다.',
        );

        const reviewedBefore = new Date();
        reviewedBefore.setDate(reviewedBefore.getDate() - 28);

        const candidates = await this.breederVerificationAdminReader.findApprovedBreedersMissingDocuments(reviewedBefore);
        const breederIds: string[] = [];
        let sentCount = 0;

        for (const breeder of candidates) {
            try {
                await this.breederVerificationAdminNotifier.sendDocumentReminder({
                    breederId: breeder.id,
                    breederName: this.breederVerificationAdminPolicyService.getBreederDisplayName(breeder),
                    emailAddress: breeder.emailAddress,
                });

                breederIds.push(breeder.id);
                sentCount++;

                await this.breederVerificationAdminWriter.appendAdminActivityLog(
                    adminId,
                    this.breederVerificationAdminActivityLogFactoryService.create(
                        AdminAction.REVIEW_BREEDER,
                        AdminTargetType.BREEDER,
                        breeder.id,
                        this.breederVerificationAdminPolicyService.getBreederDisplayName(breeder),
                        'Document reminder sent (email + alimtalk)',
                    ),
                );
            } catch (error) {
                this.logger.error(`Failed to send reminder to breeder ${breeder.id}: ${getErrorMessage(error)}`);
            }
        }

        return this.breederVerificationAdminCommandResponseService.toDocumentReminderResponse(sentCount, breederIds);
    }
}
