import { AdopterAdminReviewDeleteResultMapperService } from '../../../domain/services/adopter-admin-review-delete-result-mapper.service';

describe('AdopterAdminReviewDeleteResultMapperService', () => {
    const service = new AdopterAdminReviewDeleteResultMapperService();

    it('삭제 결과를 반환한다 (reviewId/breederId/breederName/deletedAt ISO)', () => {
        const result = service.toDeleteReviewResult('r-1', 'b-1', '브리더A');
        expect(result.reviewId).toBe('r-1');
        expect(result.breederId).toBe('b-1');
        expect(result.breederName).toBe('브리더A');
        expect(result.deletedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(result.message).toBeDefined();
    });
});
