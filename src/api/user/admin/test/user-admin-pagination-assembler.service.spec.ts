import { UserAdminPaginationAssemblerService } from '../domain/services/user-admin-pagination-assembler.service';

describe('UserAdminPaginationAssemblerService', () => {
    const service = new UserAdminPaginationAssemblerService();

    it('페이지네이션 응답 DTO를 같은 계약으로 조립한다', () => {
        const response = service.build([{ id: 'user-1' }, { id: 'user-2' }], 3, 2, 7);

        expect(response.items).toEqual([{ id: 'user-1' }, { id: 'user-2' }]);
        expect(response.pagination).toEqual({
            currentPage: 3,
            pageSize: 2,
            totalItems: 7,
            totalPages: 4,
            hasNextPage: true,
            hasPrevPage: true,
        });
    });
});
