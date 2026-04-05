import { Injectable } from '@nestjs/common';

@Injectable()
export class AdopterReportResponseFactoryService {
    create(reportId: string) {
        return {
            reportId,
            message: '신고가 성공적으로 접수되었습니다. 관리자 검토 후 처리됩니다.',
        };
    }
}
