import { Injectable } from '@nestjs/common';

import { BreederVerificationAdminBreederSnapshot } from '../../application/ports/breeder-verification-admin-reader.port';
import type { BreederVerificationListItemResult } from '../../application/types/breeder-verification-admin-result.type';
import { BreederVerificationAdminListItemPresentationService } from './breeder-verification-admin-list-item-presentation.service';

@Injectable()
export class BreederVerificationAdminLevelChangeListPresentationService {
    constructor(
        private readonly breederVerificationAdminListItemPresentationService: BreederVerificationAdminListItemPresentationService,
    ) {}

    toResponse(breeder: BreederVerificationAdminBreederSnapshot): BreederVerificationListItemResult {
        const levelChangeRequest = breeder.verification?.levelChangeRequest;

        return this.breederVerificationAdminListItemPresentationService.createBaseResponse(breeder, {
            verificationStatus: 'reviewing',
            subscriptionPlan: breeder.verification?.plan || 'basic',
            level: levelChangeRequest?.requestedLevel || breeder.verification?.level || 'new',
            submittedAt:
                levelChangeRequest?.requestedAt ||
                this.breederVerificationAdminListItemPresentationService.resolveSubmittedAt(breeder.verification),
            isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
            previousLevel: levelChangeRequest?.previousLevel,
            isLevelChange: true,
        });
    }
}
