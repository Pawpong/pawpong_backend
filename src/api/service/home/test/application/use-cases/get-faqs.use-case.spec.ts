import { GetFaqsUseCase } from '../../../application/use-cases/get-faqs.use-case';
import { HomeFaqCatalogService } from '../../../domain/services/home-faq-catalog.service';
import {
    HOME_CONTENT_READER_PORT,
    HomeContentReaderPort,
    HomeFaqSnapshot,
} from '../../../application/ports/home-content-reader.port';

function makeFaqSnapshot(overrides: Partial<HomeFaqSnapshot> = {}): HomeFaqSnapshot {
    return {
        id: 'faq-1',
        question: '입양 신청은 어떻게 하나요?',
        answer: '브리더 프로필에서 신청할 수 있습니다.',
        category: '입양',
        userType: 'adopter',
        order: 1,
        ...overrides,
    };
}

function makeContentReader(faqs: HomeFaqSnapshot[] = []): HomeContentReaderPort {
    return {
        readActiveBanners: jest.fn().mockResolvedValue([]),
        readFaqsFor: jest.fn().mockResolvedValue(faqs),
        readAvailablePets: jest.fn().mockResolvedValue([]),
    };
}

describe('FAQ 조회 유스케이스', () => {
    let useCase: GetFaqsUseCase;
    let contentReader: HomeContentReaderPort;
    const catalogService = new HomeFaqCatalogService();

    beforeEach(() => {
        contentReader = makeContentReader();
        useCase = new GetFaqsUseCase(contentReader, catalogService);
    });

    it('FAQ가 없으면 빈 배열을 반환한다', async () => {
        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('입양자(adopter) userType을 기본값으로 조회한다', async () => {
        await useCase.execute();

        expect(contentReader.readFaqsFor).toHaveBeenCalledWith('adopter');
    });

    it('userType이 breeder이면 breeder FAQ를 조회한다', async () => {
        await useCase.execute('breeder');

        expect(contentReader.readFaqsFor).toHaveBeenCalledWith('breeder');
    });

    it('알 수 없는 userType은 adopter로 처리한다', async () => {
        await useCase.execute('unknown');

        expect(contentReader.readFaqsFor).toHaveBeenCalledWith('adopter');
    });

    it('FAQ 스냅샷을 결과 형태로 변환한다', async () => {
        contentReader = makeContentReader([
            makeFaqSnapshot({ id: 'faq-xyz', question: '질문', answer: '답변', category: '일반' }),
        ]);
        useCase = new GetFaqsUseCase(contentReader, catalogService);

        const result = await useCase.execute();

        expect(result[0]).toMatchObject({
            faqId: 'faq-xyz',
            question: '질문',
            answer: '답변',
            category: '일반',
        });
    });
});
