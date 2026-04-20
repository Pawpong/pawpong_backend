import { BreederManagementStandardQuestionCatalogService } from '../../../domain/services/breeder-management-standard-question-catalog.service';

describe('BreederManagementStandardQuestionCatalogService', () => {
    const service = new BreederManagementStandardQuestionCatalogService();

    it('13개의 표준 질문을 반환한다', () => {
        expect(service.getAll()).toHaveLength(13);
    });

    it('모든 질문은 isStandard=true 이다', () => {
        expect(service.getAll().every((q) => q.isStandard)).toBe(true);
    });

    it('order는 1~13 순서를 가진다', () => {
        const orders = service.getAll().map((q) => q.order);
        expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    });

    it('getIds는 id 문자열 배열만 반환한다', () => {
        const ids = service.getIds();
        expect(ids).toHaveLength(13);
        expect(ids).toContain('privacyConsent');
        expect(ids).toContain('additionalNotes');
    });
});
