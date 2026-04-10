import { Injectable } from '@nestjs/common';

import { BreederSuspendResponseDto } from '../../dto/response/breeder-suspend-response.dto';

@Injectable()
export class BreederAdminSuspensionPresentationService {
    create(
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
}
