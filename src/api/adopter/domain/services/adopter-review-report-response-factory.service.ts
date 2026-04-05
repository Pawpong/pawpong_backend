import { Injectable } from '@nestjs/common';

import { ReviewReportResponseDto } from '../../dto/response/review-report-response.dto';

@Injectable()
export class AdopterReviewReportResponseFactoryService {
    create(): ReviewReportResponseDto {
        return {
            message: '후기가 신고되었습니다. 관리자가 검토 후 처리합니다.',
        };
    }
}
