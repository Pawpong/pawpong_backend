import { Injectable } from '@nestjs/common';

import { BreederRemindResponseDto } from '../../dto/response/breeder-remind-response.dto';
import { BreederSuspendResponseDto } from '../../dto/response/breeder-suspend-response.dto';
import { SetTestAccountResponseDto } from '../../dto/response/set-test-account-response.dto';

@Injectable()
export class BreederAdminPresentationService {
    createSuspensionResponse(
        breederId: string,
        reason: string | undefined,
        suspendedAt: Date | undefined,
        notificationSent: boolean,
    ): BreederSuspendResponseDto {
        return {
            breederId,
            reason,
            suspendedAt,
            notificationSent,
        };
    }

    createReminderResponse(
        totalCount: number,
        successIds: string[],
        failIds: string[],
        sentAt: Date,
    ): BreederRemindResponseDto {
        return {
            totalCount,
            successCount: successIds.length,
            failCount: failIds.length,
            successIds,
            failIds,
            sentAt,
        };
    }

    createSetTestAccountResponse(
        breederId: string,
        breederName: string,
        isTestAccount: boolean,
        updatedAt: Date,
    ): SetTestAccountResponseDto {
        return {
            breederId,
            breederName,
            isTestAccount,
            updatedAt,
        };
    }
}
