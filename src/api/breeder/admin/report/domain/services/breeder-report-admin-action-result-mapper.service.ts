import { Injectable } from '@nestjs/common';

import type { BreederReportAdminActionResult } from '../../application/types/breeder-report-admin-result.type';

@Injectable()
export class BreederReportAdminActionResultMapperService {
    toResult(
        reportId: string,
        breederId: string,
        action: string,
        status: string,
        adminNotes: string | undefined,
        processedAt: Date,
    ): BreederReportAdminActionResult {
        return {
            reportId,
            breederId,
            action,
            status,
            adminNotes,
            processedAt,
        };
    }
}
