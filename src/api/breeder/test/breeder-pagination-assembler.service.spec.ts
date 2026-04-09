import { BreederPaginationAssemblerService } from '../domain/services/breeder-pagination-assembler.service';

describe('BreederPaginationAssemblerService', () => {
    const service = new BreederPaginationAssemblerService();

    it('PaginationBuilder를 같은 기준으로 생성한다', () => {
        const builder = service.createBuilder([{ id: 'pet-1' }], 2, 3, 8);

        expect(builder._items).toEqual([{ id: 'pet-1' }]);
        expect(builder._page).toBe(2);
        expect(builder._limit).toBe(3);
        expect(builder._totalCount).toBe(8);
    });

    it('페이지네이션 응답 DTO를 같은 계약으로 조립한다', () => {
        const response = service.build([{ id: 'pet-1' }, { id: 'pet-2' }], 2, 2, 5);

        expect(response.items).toEqual([{ id: 'pet-1' }, { id: 'pet-2' }]);
        expect(response.pagination).toEqual({
            currentPage: 2,
            pageSize: 2,
            totalItems: 5,
            totalPages: 3,
            hasNextPage: true,
            hasPrevPage: true,
        });
    });
});
