import { Inject, Injectable } from '@nestjs/common';

import { AdminTargetType, VerificationStatus } from '../../../../../../common/enum/user.enum';
import { BREEDER_VERIFICATION_ADMIN_READER_PORT } from '../ports/breeder-verification-admin-reader.port';
import { BREEDER_VERIFICATION_ADMIN_WRITER_PORT } from '../ports/breeder-verification-admin-writer.port';
import { BREEDER_VERIFICATION_ADMIN_NOTIFIER_PORT } from '../ports/breeder-verification-admin-notifier.port';
import type { BreederVerificationAdminReaderPort } from '../ports/breeder-verification-admin-reader.port';
import type { BreederVerificationAdminWriterPort } from '../ports/breeder-verification-admin-writer.port';
import type { BreederVerificationAdminNotifierPort } from '../ports/breeder-verification-admin-notifier.port';
import { BreederVerificationAdminActivityLogFactoryService } from '../../domain/services/breeder-verification-admin-activity-log-factory.service';
import { BreederVerificationAdminPolicyService } from '../../domain/services/breeder-verification-admin-policy.service';
import type { BreederVerificationUpdateCommand } from '../types/breeder-verification-admin-command.type';
import { DomainConflictError } from '../../../../../../common/error/domain.error';

@Injectable()
export class UpdateBreederVerificationUseCase {
    constructor(
        @Inject(BREEDER_VERIFICATION_ADMIN_READER_PORT)
        private readonly breederVerificationAdminReader: BreederVerificationAdminReaderPort,
        @Inject(BREEDER_VERIFICATION_ADMIN_WRITER_PORT)
        private readonly breederVerificationAdminWriter: BreederVerificationAdminWriterPort,
        @Inject(BREEDER_VERIFICATION_ADMIN_NOTIFIER_PORT)
        private readonly breederVerificationAdminNotifier: BreederVerificationAdminNotifierPort,
        private readonly breederVerificationAdminPolicyService: BreederVerificationAdminPolicyService,
        private readonly breederVerificationAdminActivityLogFactoryService: BreederVerificationAdminActivityLogFactoryService,
    ) {}

    async execute(
        adminId: string,
        breederId: string,
        verificationData: BreederVerificationUpdateCommand,
    ): Promise<{ message: string }> {
        this.breederVerificationAdminPolicyService.assertCanManageBreeders(
            await this.breederVerificationAdminReader.findAdminById(adminId),
            'Access denied',
        );

        const breeder = this.breederVerificationAdminPolicyService.assertVerificationRequestExists(
            this.breederVerificationAdminPolicyService.assertBreederExists(
                await this.breederVerificationAdminReader.findBreederById(breederId),
            ),
        );

        const expectedStatus = this.breederVerificationAdminPolicyService.assertVerificationTransition(
            breeder.verification?.status,
            verificationData.verificationStatus,
        );
        const reviewedAt = new Date();
        const updated = await this.breederVerificationAdminWriter.updateBreederVerification(breederId, {
            expectedStatus,
            verificationStatus: verificationData.verificationStatus,
            reviewedAt,
            ...(verificationData.rejectionReason !== undefined
                ? {
                      rejectionReason: verificationData.rejectionReason,
                  }
                : {}),
        });

        if (!updated) {
            throw new DomainConflictError('다른 요청에서 심사가 변경되었습니다. 새로고침 후 확인해주세요.');
        }

        await this.breederVerificationAdminWriter.appendAdminActivityLog(
            adminId,
            this.breederVerificationAdminActivityLogFactoryService.create(
                this.breederVerificationAdminPolicyService.resolveAdminAction(verificationData.verificationStatus),
                AdminTargetType.BREEDER,
                breederId,
                this.breederVerificationAdminPolicyService.getBreederDisplayName(breeder),
                `Breeder verification ${verificationData.verificationStatus}`,
            ),
        );

        const recipient = {
            breederId,
            breederName: this.breederVerificationAdminPolicyService.getBreederDisplayName(breeder),
            emailAddress: breeder.emailAddress,
        };

        if (verificationData.verificationStatus === VerificationStatus.APPROVED) {
            await this.breederVerificationAdminNotifier.sendApproval(recipient);
        } else if (verificationData.verificationStatus === VerificationStatus.REJECTED) {
            await this.breederVerificationAdminNotifier.sendRejection(recipient, verificationData.rejectionReason);
        }

        return {
            message: `Breeder verification ${verificationData.verificationStatus}`,
        };
    }
}
