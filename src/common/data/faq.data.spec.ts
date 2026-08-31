import { faqData } from './faq.data';

describe('FAQ 정책 데이터', () => {
    it('사용자 유형별 순서가 중복 없이 연속된다', () => {
        for (const userType of ['adopter', 'breeder'] as const) {
            const orders = faqData.filter((faq) => faq.userType === userType).map((faq) => faq.order);
            expect(orders).toEqual(Array.from({ length: orders.length }, (_, index) => index + 1));
        }
    });

    it('폐기된 New/Elite 등급을 안내하지 않는다', () => {
        const searchable = faqData.map(({ question, answer }) => `${question}\n${answer}`).join('\n');
        expect(searchable).not.toMatch(/뉴 레벨|엘리트 레벨|Elite 등급|New 등급/);
    });

    it('입양자와 브리더 모두에게 파충류 흐름을 안내한다', () => {
        expect(faqData.some((faq) => faq.userType === 'adopter' && /도마뱀|파충류/.test(faq.question))).toBe(true);
        expect(faqData.some((faq) => faq.userType === 'breeder' && /도마뱀|파충류/.test(faq.question))).toBe(true);
    });
});
