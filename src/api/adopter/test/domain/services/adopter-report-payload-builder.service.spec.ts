import { ReportStatus } from '../../../../../common/enum/user.enum';
import { AdopterReportPayloadBuilderService } from '../../../domain/services/adopter-report-payload-builder.service';

describe('AdopterReportPayloadBuilderService', () => {
    const service = new AdopterReportPayloadBuilderService();

    it('고유 reportId와 payload를 생성한다', () => {
        const first = service.build('u-1', '신고자', { reason: '욕설', description: '상세' } as any);
        const second = service.build('u-1', '신고자', { reason: '욕설', description: '상세' } as any);
        expect(first.reportId).toBeDefined();
        expect(first.reportId).not.toBe(second.reportId);
        expect(first.report.status).toBe(ReportStatus.PENDING);
        expect(first.report.reporterId).toBe('u-1');
        expect(first.report.type).toBe('욕설');
    });

    it('description이 없으면 빈 문자열', () => {
        const result = service.build('u-1', '이름', { reason: 'abusive' } as any);
        expect(result.report.description).toBe('');
    });
});
