import { Injectable } from '@nestjs/common';

import {
    BreederVerificationAdminBreederSnapshot,
    BreederVerificationAdminVerificationSnapshot,
} from '../../application/ports/breeder-verification-admin-reader.port';
import type { BreederVerificationInfoResult, BreederVerificationListItemResult } from '../../application/types/breeder-verification-admin-result.type';

@Injectable()
export class BreederVerificationAdminListItemPresentationService {
    createBaseResponse(
        breeder: BreederVerificationAdminBreederSnapshot,
        verificationInfo: BreederVerificationInfoResult,
    ): BreederVerificationListItemResult {
        return {
            breederId: breeder.id,
            breederName: breeder.nickname,
            emailAddress: breeder.emailAddress,
            phoneNumber: breeder.phoneNumber,
            accountStatus: breeder.accountStatus || 'active',
            isTestAccount: breeder.isTestAccount || false,
            verificationInfo,
            profileInfo: breeder.profile,
            createdAt: breeder.createdAt!,
        };
    }

    resolveSubmittedAt(verification?: BreederVerificationAdminVerificationSnapshot): Date | undefined {
        if (!verification) {
            return undefined;
        }

        if (verification.submittedAt) {
            return verification.submittedAt;
        }

        const uploadDates = (verification.documents || [])
            .map((document) => document.uploadedAt)
            .filter((date): date is Date => date !== undefined)
            .sort((left, right) => left.getTime() - right.getTime());

        return uploadDates[0];
    }
}
