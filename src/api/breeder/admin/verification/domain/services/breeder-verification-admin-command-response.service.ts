import { Injectable } from '@nestjs/common';

import { BreederVerificationAdminBreederSnapshot } from '../../application/ports/breeder-verification-admin-reader.port';
import { BreederLevelChangeResponseDto } from '../../dto/response/breeder-level-change-response.dto';

@Injectable()
export class BreederVerificationAdminCommandResponseService {
    toLevelChangeResponse(
        breeder: BreederVerificationAdminBreederSnapshot,
        previousLevel: string,
        newLevel: string,
        changedAt: Date,
        changedBy: string,
    ): BreederLevelChangeResponseDto {
        return {
            breederId: breeder.id,
            breederName: breeder.nickname,
            previousLevel,
            newLevel,
            changedAt,
            changedBy,
        };
    }

    toDocumentReminderResponse(sentCount: number, breederIds: string[]): { sentCount: number; breederIds: string[] } {
        return {
            sentCount,
            breederIds,
        };
    }
}
