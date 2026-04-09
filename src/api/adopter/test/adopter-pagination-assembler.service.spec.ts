import { AdopterPaginationAssemblerService } from '../domain/services/adopter-pagination-assembler.service';

describe('입양자 페이지네이션 조립 서비스', () => {
    const service = new AdopterPaginationAssemblerService();

    it('PaginationBuilder를 같은 기준으로 생성한다', () => {
        const builder = service.createBuilder([{ id: 'application-1' }], 1, 10, 3);

        expect(builder._items).toEqual([{ id: 'application-1' }]);
        expect(builder._page).toBe(1);
        expect(builder._limit).toBe(10);
        expect(builder._totalCount).toBe(3);
    });

    it('페이지네이션 응답 객체를 조립한다', () => {
        const response = service.build([{ id: 'favorite-1' }], 2, 5, 11);

        expect(response.items).toEqual([{ id: 'favorite-1' }]);
        expect(response.pagination).toEqual({
            currentPage: 2,
            pageSize: 5,
            totalItems: 11,
            totalPages: 3,
            hasNextPage: true,
            hasPrevPage: true,
        });
    });
});
