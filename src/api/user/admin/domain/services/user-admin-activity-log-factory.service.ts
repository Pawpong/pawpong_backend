import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';
import { UserAdminActivityLogEntry } from '../../application/ports/user-admin-writer.port';

@Injectable()
export class UserAdminActivityLogFactoryService {
    create(
        action: AdminAction,
        targetType: AdminTargetType,
        targetId: string,
        targetName?: string,
        description?: string,
    ): UserAdminActivityLogEntry {
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
