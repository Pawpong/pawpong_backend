import { Injectable } from '@nestjs/common';

import type { AdopterReportCreateResult } from '../../application/types/adopter-result.type';

@Injectable()
export class AdopterReportResponseFactoryService {
    create(reportId: string): AdopterReportCreateResult {
        return {
            reportId,
            message: '신고가 성공적으로 접수되었습니다. 관리자 검토 후 처리됩니다.',
        };
    }
}
