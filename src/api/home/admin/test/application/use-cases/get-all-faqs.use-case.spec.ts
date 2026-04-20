import { GetAllFaqsUseCase } from '../../../application/use-cases/get-all-faqs.use-case';
import { HomeFaqCatalogService } from '../../../../domain/services/home-faq-catalog.service';
import { HomeFaqSnapshot } from '../../../../application/ports/home-content-reader.port';

function makeFaqSnapshot(overrides: Partial<HomeFaqSnapshot> = {}): HomeFaqSnapshot {
    return {
        id: 'faq-1',
        question: '자주 묻는 질문',
        answer: '자세한 답변입니다.',
        category: '일반',
        userType: 'adopter',
        order: 1,
        ...overrides,
    };
}

function makeManager(faqs: HomeFaqSnapshot[] = []) {
    return {
        readAllBanners: jest.fn(),
        createBanner: jest.fn(),
        updateBanner: jest.fn(),
        deleteBanner: jest.fn(),
        readAllFaqs: jest.fn().mockResolvedValue(faqs),
        createFaq: jest.fn(),
        updateFaq: jest.fn(),
        deleteFaq: jest.fn(),
    };
}

describe('전체 FAQ 목록 조회 유스케이스 (Admin)', () => {
    const catalogService = new HomeFaqCatalogService();

    it('전체 FAQ 목록을 반환한다', async () => {
        const useCase = new GetAllFaqsUseCase(
            makeManager([makeFaqSnapshot(), makeFaqSnapshot({ id: 'faq-2', order: 2 })]),
            catalogService,
        );

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
        expect(result[0].faqId).toBe('faq-1');
    });

    it('FAQ가 없으면 빈 배열을 반환한다', async () => {
        const useCase = new GetAllFaqsUseCase(makeManager([]), catalogService);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });
});
