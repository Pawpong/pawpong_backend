import { Injectable } from '@nestjs/common';

import { BreederVerificationAdminBreederSnapshot } from '../../application/ports/breeder-verification-admin-reader.port';
import type {
    BreederDocumentReminderResult,
    BreederLevelChangeResult,
} from '../../application/types/breeder-verification-admin-result.type';

@Injectable()
export class BreederVerificationAdminCommandResultMapperService {
    toLevelChangeResult(
        breeder: BreederVerificationAdminBreederSnapshot,
        previousLevel: string,
        newLevel: string,
        changedAt: Date,
        changedBy: string,
    ): BreederLevelChangeResult {
        return {
            breederId: breeder.id,
            breederName: breeder.nickname,
            previousLevel,
            newLevel,
            changedAt,
            changedBy,
        };
    }

    toDocumentReminderResult(sentCount: number, breederIds: string[]): BreederDocumentReminderResult {
        return {
            sentCount,
            breederIds,
        };
    }
}
