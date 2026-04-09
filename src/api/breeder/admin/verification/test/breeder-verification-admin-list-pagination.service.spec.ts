import { BreederPaginationAssemblerService } from '../../../domain/services/breeder-pagination-assembler.service';
import { BreederVerificationAdminListPaginationService } from '../domain/services/breeder-verification-admin-list-pagination.service';

describe('브리더 인증 관리자 목록 페이지 응답 서비스', () => {
    it('목록 페이지네이션 응답을 조립한다', () => {
        const service = new BreederVerificationAdminListPaginationService(new BreederPaginationAssemblerService());

        expect(service.toPaginatedResponse([{ breederId: 'breeder-1' }], 1, 10, 1)).toMatchObject({
            items: [{ breederId: 'breeder-1' }],
            pagination: {
                currentPage: 1,
                pageSize: 10,
                totalItems: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
            },
        });
    });
});
