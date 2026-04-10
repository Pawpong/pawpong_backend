import { Injectable } from '@nestjs/common';

import type { AdopterReviewReportResult } from '../../application/types/adopter-result.type';

@Injectable()
export class AdopterReviewReportResponseFactoryService {
    create(): AdopterReviewReportResult {
        return {
            message: '후기가 신고되었습니다. 관리자가 검토 후 처리합니다.',
        };
    }
}
