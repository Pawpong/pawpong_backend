import { Injectable } from '@nestjs/common';

import { BreederRemindResponseDto } from '../../dto/response/breeder-remind-response.dto';

@Injectable()
export class BreederAdminReminderPresentationService {
    create(totalCount: number, successIds: string[], failIds: string[], sentAt: Date): BreederRemindResponseDto {
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
