import { Injectable } from '@nestjs/common';

import { VerificationStatus } from '../../../../common/enum/user.enum';
import type { BreederManagementVerificationRecord } from '../../application/ports/breeder-management-settings.port';
import type { BreederManagementVerificationSubmitCommand } from '../../application/types/breeder-management-verification-command.type';

@Injectable()
export class BreederManagementVerificationSubmissionMapperService {
    toVerificationRecord(
        verificationData: BreederManagementVerificationSubmitCommand,
    ): BreederManagementVerificationRecord {
        return {
            status: VerificationStatus.REVIEWING,
            plan: verificationData.plan,
            submittedAt: new Date(),
            documents: verificationData.documents as any,
            submittedByEmail: verificationData.submittedByEmail,
        };
    }
}
