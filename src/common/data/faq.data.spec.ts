import { faqData } from './faq.data';

describe('FAQ 정책 데이터', () => {
    it('사용자 유형별 순서가 중복 없이 연속된다', () => {
        for (const userType of ['adopter', 'breeder'] as const) {
            const orders = faqData.filter((faq) => faq.userType === userType).map((faq) => faq.order);
            expect(orders).toEqual(Array.from({ length: orders.length }, (_, index) => index + 1));
        }
    });

    it('폐기된 브리더 등급이나 내부 상태값을 사용자 안내에 노출하지 않는다', () => {
        const searchable = faqData.map(({ question, answer }) => `${question}\n${answer}`).join('\n');
        expect(searchable).not.toMatch(/\bnew\b|\belite\b|뉴\s*(브리더|레벨|등급)|엘리트\s*(브리더|레벨|등급)/i);
        expect(searchable).not.toMatch(/\bpending\b|\breviewing\b|\bapproved\b|\brejected\b/i);
    });

    it('분양 상세의 실제 개별 분양가 흐름만 안내한다', () => {
        const priceFaq = faqData.find((faq) => faq.question === '분양 비용은 어떻게 확인하나요?');
        expect(priceFaq?.answer).toContain('각 분양글에 입력한 분양가');
        expect(priceFaq?.answer).not.toMatch(/가격 범위|상담 후 공개/);
    });

    it('입양자와 브리더 모두에게 파충류 흐름을 안내한다', () => {
        expect(faqData.some((faq) => faq.userType === 'adopter' && /도마뱀|파충류/.test(faq.question))).toBe(true);
        expect(faqData.some((faq) => faq.userType === 'breeder' && /도마뱀|파충류/.test(faq.question))).toBe(true);
    });
});
