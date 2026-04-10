import { Injectable } from '@nestjs/common';

import type { BreederAdminReminderResult } from '../../application/types/breeder-admin-result.type';

@Injectable()
export class BreederAdminReminderPresentationService {
    create(totalCount: number, successIds: string[], failIds: string[], sentAt: Date): BreederAdminReminderResult {
        return {
            totalCount,
            successCount: successIds.length,
            failCount: failIds.length,
            successIds,
            failIds,
            sentAt,
        };
    }
}
