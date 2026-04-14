import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { ReportStatus } from '../../../../common/enum/user.enum';
import type { AdopterReportCreateCommand } from '../../application/types/adopter-report-command.type';

@Injectable()
export class AdopterReportPayloadBuilderService {
    build(userId: string, reporterName: string, dto: AdopterReportCreateCommand) {
        const reportId = randomUUID();
        const report = {
            reportId,
            reporterId: userId,
            reporterName,
            type: dto.reason,
            description: dto.description || '',
            reportedAt: new Date(),
            status: ReportStatus.PENDING,
        };

        return { reportId, report };
    }
}
