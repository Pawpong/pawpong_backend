import { Injectable } from '@nestjs/common';

import type { BreederDocumentReminderResult } from '../../application/types/breeder-verification-admin-result.type';

@Injectable()
export class BreederVerificationAdminCommandResultMapperService {
    toDocumentReminderResult(sentCount: number, breederIds: string[]): BreederDocumentReminderResult {
        return {
            sentCount,
            breederIds,
        };
    }
}
