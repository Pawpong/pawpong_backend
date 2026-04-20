import { CreateFaqUseCase } from '../../../application/use-cases/create-faq.use-case';
import { HomeFaqCatalogService } from '../../../../domain/services/home-faq-catalog.service';
import { HomeFaqSnapshot } from '../../../../application/ports/home-content-reader.port';

function makeFaqSnapshot(overrides: Partial<HomeFaqSnapshot> = {}): HomeFaqSnapshot {
    return {
        id: 'faq-1',
        question: '질문',
        answer: '답변',
        category: '일반',
        userType: 'adopter',
        order: 1,
        ...overrides,
    };
}

function makeManager(createdFaq: HomeFaqSnapshot) {
    return {
        readAllBanners: jest.fn(),
        createBanner: jest.fn(),
        updateBanner: jest.fn(),
        deleteBanner: jest.fn(),
        readAllFaqs: jest.fn(),
        createFaq: jest.fn().mockResolvedValue(createdFaq),
        updateFaq: jest.fn(),
        deleteFaq: jest.fn(),
    };
}

describe('FAQ 생성 유스케이스 (Admin)', () => {
    const catalogService = new HomeFaqCatalogService();

    it('FAQ를 생성하고 결과를 반환한다', async () => {
        const useCase = new CreateFaqUseCase(makeManager(makeFaqSnapshot()), catalogService);

        const result = await useCase.execute({
            question: '질문',
            answer: '답변',
            category: '일반',
            userType: 'adopter',
            order: 1,
            isActive: true,
        });

        expect(result.faqId).toBe('faq-1');
        expect(result.question).toBe('질문');
    });
});
