import { BreederManagementPaginationAssemblerService } from '../../../domain/services/breeder-management-pagination-assembler.service';

describe('BreederManagementPaginationAssemblerService', () => {
    const service = new BreederManagementPaginationAssemblerService();

    it('PageResult로 변환한다', () => {
        const result = service.toPage([{ id: 1 }, { id: 2 }], 1, 10, 25);
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
});
