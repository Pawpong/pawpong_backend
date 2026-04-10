import { Injectable } from '@nestjs/common';

import { BreederVerificationResponseDto } from '../../dto/response/breeder-verification-response.dto';
import { BreederVerificationAdminBreederSnapshot } from '../../application/ports/breeder-verification-admin-reader.port';
import { BreederVerificationAdminListItemPresentationService } from './breeder-verification-admin-list-item-presentation.service';

@Injectable()
export class BreederVerificationAdminPendingBreederListPresentationService {
    constructor(
        private readonly breederVerificationAdminListItemPresentationService: BreederVerificationAdminListItemPresentationService,
    ) {}

    toResponse(breeder: BreederVerificationAdminBreederSnapshot): BreederVerificationResponseDto {
        return this.breederVerificationAdminListItemPresentationService.createBaseResponse(breeder, {
            verificationStatus: breeder.verification?.status || 'pending',
            subscriptionPlan: breeder.verification?.plan || 'basic',
            level: breeder.verification?.level || 'new',
            submittedAt: this.breederVerificationAdminListItemPresentationService.resolveSubmittedAt(
                breeder.verification,
            ),
            isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
        });
    }
}
