import { Injectable } from '@nestjs/common';

import { BreederVerificationAdminBreederSnapshot } from '../../application/ports/breeder-verification-admin-reader.port';
import type { BreederVerificationListItemResult } from '../../application/types/breeder-verification-admin-result.type';
import { BreederVerificationAdminListItemMapperService } from './breeder-verification-admin-list-item-mapper.service';

@Injectable()
export class BreederVerificationAdminPendingBreederItemMapperService {
    constructor(
        private readonly breederVerificationAdminListItemMapperService: BreederVerificationAdminListItemMapperService,
    ) {}

    toResponse(breeder: BreederVerificationAdminBreederSnapshot): BreederVerificationListItemResult {
        return this.breederVerificationAdminListItemMapperService.toResult(breeder, {
            verificationStatus: breeder.verification?.status || 'pending',
            subscriptionPlan: breeder.verification?.plan || 'basic',
            level: breeder.verification?.level || 'new',
            submittedAt: this.breederVerificationAdminListItemMapperService.resolveSubmittedAt(breeder.verification),
            isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
        });
    }
}
