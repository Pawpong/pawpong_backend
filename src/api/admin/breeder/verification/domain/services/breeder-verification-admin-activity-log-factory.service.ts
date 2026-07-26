import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { AdminAction, AdminTargetType } from '../../../../../../common/enum/user.enum';
import { BreederVerificationAdminActivityLogEntry } from '../../application/ports/breeder-verification-admin-writer.port';

@Injectable()
export class BreederVerificationAdminActivityLogFactoryService {
    create(
        action: AdminAction,
        targetType: AdminTargetType,
        targetId: string,
        targetName?: string,
        description?: string,
    ): BreederVerificationAdminActivityLogEntry {
        return {
            logId: randomUUID(),
            action,
            targetType,
            targetId,
            targetName,
            description: description || `${action} performed on ${targetType} ${targetName || targetId}`,
            performedAt: new Date(),
        };
    }
}
