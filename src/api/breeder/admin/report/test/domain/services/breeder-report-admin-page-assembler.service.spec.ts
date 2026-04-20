import { BreederReportAdminPageAssemblerService } from '../../../domain/services/breeder-report-admin-page-assembler.service';
import { BreederPaginationAssemblerService } from '../../../../../domain/services/breeder-pagination-assembler.service';

describe('BreederReportAdminPageAssemblerService', () => {
    const service = new BreederReportAdminPageAssemblerService(new BreederPaginationAssemblerService());

    it('snapshot 목록을 item으로 매핑하고 페이지네이션을 구성한다', () => {
        const result = service.build(
            {
                items: [
                    {
                        reportId: 'r-1',
                        targetId: 'b-1',
                        targetName: '브리더',
                        type: 'abuse',
                        description: '설명',
                        status: 'pending',
                        reportedAt: new Date(),
                        adminNotes: undefined,
                    } as any,
                ],
                totalCount: 1,
            },
            1,
            10,
        );
        expect(result.items).toHaveLength(1);
        expect(result.items[0].reportId).toBe('r-1');
        expect(result.pagination.totalItems).toBe(1);
    });

    it('빈 items도 처리한다', () => {
        const result = service.build({ items: [], totalCount: 0 }, 1, 10);
        expect(result.items).toEqual([]);
    });
});
