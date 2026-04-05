import { Injectable } from '@nestjs/common';

import { VerificationStatus } from '../../../../common/enum/user.enum';
import { VerificationSubmitRequestDto } from '../../dto/request/verification-submit-request.dto';
import type { BreederManagementVerificationRecord } from '../../application/ports/breeder-management-settings.port';

@Injectable()
export class BreederManagementVerificationSubmissionMapperService {
    toVerificationRecord(verificationData: VerificationSubmitRequestDto): BreederManagementVerificationRecord {
        return {
            status: VerificationStatus.REVIEWING,
            plan: verificationData.plan,
            submittedAt: new Date(),
            documents: verificationData.documents as any,
            submittedByEmail: verificationData.submittedByEmail,
        };
    }
}
