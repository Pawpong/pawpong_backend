import { AppVersionAdminPaginationAssemblerService } from '../../../domain/services/app-version-admin-pagination-assembler.service';

describe('AppVersionAdminPaginationAssemblerService', () => {
    const service = new AppVersionAdminPaginationAssemblerService();

    it('items와 pagination 정보를 구성한다', () => {
        const result = service.build([{ id: 1 }, { id: 2 }], 1, 10, 25);

        expect(result.items).toHaveLength(2);
        expect(result.pagination).toEqual({
            currentPage: 1,
            pageSize: 10,
            totalItems: 25,
            totalPages: 3,
            hasNextPage: true,
            hasPrevPage: false,
        });
    });

    it('마지막 페이지는 hasNextPage가 false다', () => {
        const result = service.build([], 3, 10, 25);
        expect(result.pagination.hasNextPage).toBe(false);
        expect(result.pagination.hasPrevPage).toBe(true);
    });

    it('totalItems가 0이면 totalPages도 0이다', () => {
        const result = service.build([], 1, 10, 0);
        expect(result.pagination.totalPages).toBe(0);
    });
});
