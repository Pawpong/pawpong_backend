import { BreederPaginationAssemblerService } from '../domain/services/breeder-pagination-assembler.service';

describe('브리더 페이지네이션 조립 서비스', () => {
    const service = new BreederPaginationAssemblerService();

    it('페이지네이션 응답 객체를 같은 계약으로 조립한다', () => {
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
