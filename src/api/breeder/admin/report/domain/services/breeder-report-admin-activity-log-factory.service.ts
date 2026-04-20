import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { AdminAction, AdminTargetType } from '../../../../../../common/enum/user.enum';
import { BreederReportAdminActivityLogEntry } from '../../application/ports/breeder-report-admin-writer.port';

@Injectable()
export class BreederReportAdminActivityLogFactoryService {
    create(
        action: AdminAction,
        targetId: string,
        targetName: string | undefined,
        description: string,
    ): BreederReportAdminActivityLogEntry {
        return {
            logId: randomUUID(),
            action,
            targetType: AdminTargetType.BREEDER,
            targetId,
            targetName,
            description,
            performedAt: new Date(),
        };
    }
}
