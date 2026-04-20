import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';
import { AdopterAdminActivityLogEntry } from '../../application/ports/adopter-admin-writer.port';

@Injectable()
export class AdopterAdminActivityLogFactoryService {
    create(
        action: AdminAction,
        targetType: AdminTargetType,
        targetId: string,
        targetName?: string,
        description?: string,
    ): AdopterAdminActivityLogEntry {
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
