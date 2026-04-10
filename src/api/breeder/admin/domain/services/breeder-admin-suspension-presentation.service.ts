import { Injectable } from '@nestjs/common';

import type { BreederAdminSuspensionResult } from '../../application/types/breeder-admin-result.type';

@Injectable()
export class BreederAdminSuspensionPresentationService {
    create(
        breederId: string,
        reason: string | undefined,
        suspendedAt: Date | undefined,
        notificationSent: boolean,
    ): BreederAdminSuspensionResult {
        return {
            breederId,
            reason,
            suspendedAt,
            notificationSent,
        };
    }
}
