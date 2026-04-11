import { Injectable } from '@nestjs/common';

import { BreederVerificationAdminBreederSnapshot } from '../../application/ports/breeder-verification-admin-reader.port';
import type { BreederVerificationListItemResult } from '../../application/types/breeder-verification-admin-result.type';
import { BreederVerificationAdminListItemMapperService } from './breeder-verification-admin-list-item-mapper.service';

@Injectable()
export class BreederVerificationAdminLevelChangeItemMapperService {
    constructor(
        private readonly breederVerificationAdminListItemMapperService: BreederVerificationAdminListItemMapperService,
    ) {}

    toResponse(breeder: BreederVerificationAdminBreederSnapshot): BreederVerificationListItemResult {
        const levelChangeRequest = breeder.verification?.levelChangeRequest;

        return this.breederVerificationAdminListItemMapperService.toResult(breeder, {
            verificationStatus: 'reviewing',
            subscriptionPlan: breeder.verification?.plan || 'basic',
            level: levelChangeRequest?.requestedLevel || breeder.verification?.level || 'new',
            submittedAt:
                levelChangeRequest?.requestedAt ||
                this.breederVerificationAdminListItemMapperService.resolveSubmittedAt(breeder.verification),
            isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
            previousLevel: levelChangeRequest?.previousLevel,
            isLevelChange: true,
        });
    }
}
