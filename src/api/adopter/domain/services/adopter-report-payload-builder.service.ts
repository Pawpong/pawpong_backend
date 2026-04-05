import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { ReportStatus } from '../../../../common/enum/user.enum';
import { AdopterMapper } from '../../mapper/adopter.mapper';
import { ReportCreateRequestDto } from '../../dto/request/report-create-request.dto';

@Injectable()
export class AdopterReportPayloadBuilderService {
    build(userId: string, reporterName: string, dto: ReportCreateRequestDto) {
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
