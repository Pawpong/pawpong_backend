import { BreederReportAdminActionResultMapperService } from '../../../domain/services/breeder-report-admin-action-result-mapper.service';

describe('BreederReportAdminActionResultMapperService', () => {
    const service = new BreederReportAdminActionResultMapperService();

    it('신고 조치 결과를 반환한다', () => {
        const at = new Date();
        const result = service.toResult('r-1', 'b-1', 'resolve', 'resolved', '노트', at);
        expect(result).toEqual({ reportId: 'r-1', breederId: 'b-1', action: 'resolve', status: 'resolved', adminNotes: '노트', processedAt: at });
    });

    it('adminNotes가 undefined여도 처리한다', () => {
        const result = service.toResult('r-1', 'b-1', 'reject', 'dismissed', undefined, new Date());
        expect(result.adminNotes).toBeUndefined();
    });
});
