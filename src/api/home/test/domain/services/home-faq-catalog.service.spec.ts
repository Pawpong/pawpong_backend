import { HomeFaqCatalogService } from '../../../domain/services/home-faq-catalog.service';

describe('HomeFaqCatalogService', () => {
    const service = new HomeFaqCatalogService();

    it('FAQ snapshot을 result로 매핑한다', () => {
        const result = service.buildResults([
            {
                id: 'f-1',
                question: '질문',
                answer: '답변',
                category: '일반',
                userType: 'adopter',
                order: 1,
            } as any,
        ]);
        expect(result[0]).toEqual({
            faqId: 'f-1',
            question: '질문',
            answer: '답변',
            category: '일반',
            userType: 'adopter',
            order: 1,
        });
    });

    it('빈 배열을 반환할 수 있다', () => {
        expect(service.buildResults([])).toEqual([]);
    });
});
