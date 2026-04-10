import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { ReportStatus } from '../../../../common/enum/user.enum';
import { AdopterMapper } from '../../mapper/adopter.mapper';
import type { AdopterReportCreateCommand } from '../../application/types/adopter-report-command.type';

@Injectable()
export class AdopterReportPayloadBuilderService {
    build(userId: string, reporterName: string, dto: AdopterReportCreateCommand) {
        const reportId = randomUUID();
        const report = AdopterMapper.toReport(
            reportId,
            userId,
            reporterName,
            dto.reason,
            dto.description || '',
            ReportStatus.PENDING,
        );

        return { reportId, report };
    }
}
