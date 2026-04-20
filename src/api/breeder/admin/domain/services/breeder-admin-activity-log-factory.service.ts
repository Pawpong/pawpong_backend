import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { AdminTargetType } from '../../../../../common/enum/user.enum';
import { BreederAdminActivityLogEntry } from '../../application/ports/breeder-admin-writer.port';

@Injectable()
export class BreederAdminActivityLogFactoryService {
    create(
        action: string,
        targetType: AdminTargetType,
        targetId: string,
        targetName?: string,
        description?: string,
    ): BreederAdminActivityLogEntry {
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
