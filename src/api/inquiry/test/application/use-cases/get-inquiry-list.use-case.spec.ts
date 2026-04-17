import { GetInquiryListUseCase } from '../../../application/use-cases/get-inquiry-list.use-case';
import { InquiryViewService } from '../../../domain/services/inquiry-view.service';
import { InquiryListSnapshot } from '../../../application/ports/inquiry-reader.port';

function makeInquirySnapshot(overrides: Partial<InquiryListSnapshot> = {}): InquiryListSnapshot {
    return {
        id: 'inquiry-1',
        authorId: 'user-1',
        authorNickname: '입양자',
        title: '문의 제목',
        content: '문의 내용',
        type: 'common',
        animalType: 'dog',
        imageUrls: [],
        viewCount: 0,
        answers: [],
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

describe('공개 문의 목록 조회 유스케이스', () => {
    const inquiryReader = {
        readBreederList: jest.fn(),
        readPublicList: jest.fn(),
        readMyList: jest.fn(),
        readDetail: jest.fn(),
        incrementViewCount: jest.fn(),
    };
    const inquiryAssetUrl = {
        generateSignedUrl: jest.fn((fileName: string) => `signed:${fileName}`),
    };

    const useCase = new GetInquiryListUseCase(
        inquiryReader as any,
        new InquiryViewService(),
        inquiryAssetUrl as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('공개 문의 목록을 반환한다', async () => {
        inquiryReader.readPublicList.mockResolvedValue([makeInquirySnapshot()]);

        const result = await useCase.execute();

        expect(result.data).toHaveLength(1);
    });

    it('목록이 없으면 빈 배열을 반환한다', async () => {
        inquiryReader.readPublicList.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result.data).toEqual([]);
        expect(result.hasMore).toBe(false);
    });

    it('기본 정렬은 latest_answer로 설정된다', async () => {
        inquiryReader.readPublicList.mockResolvedValue([]);

        await useCase.execute();

        expect(inquiryReader.readPublicList).toHaveBeenCalledWith(
            expect.objectContaining({ sort: 'latest_answer' }),
        );
    });

    it('animalType 필터를 리더에게 전달한다', async () => {
        inquiryReader.readPublicList.mockResolvedValue([]);

        await useCase.execute(1, 15, 'cat');

        expect(inquiryReader.readPublicList).toHaveBeenCalledWith(
            expect.objectContaining({ animalType: 'cat' }),
        );
    });

    it('페이지 2는 올바른 skip 값을 계산한다', async () => {
        inquiryReader.readPublicList.mockResolvedValue([]);

        await useCase.execute(2, 15);

        expect(inquiryReader.readPublicList).toHaveBeenCalledWith(
            expect.objectContaining({ skip: 15, limit: 16 }),
        );
    });

    it('다음 페이지가 있으면 hasMore가 true다', async () => {
        const limit = 5;
        inquiryReader.readPublicList.mockResolvedValue(
            Array.from({ length: limit + 1 }, (_, i) => makeInquirySnapshot({ id: `inquiry-${i}` })),
        );

        const result = await useCase.execute(1, limit);

        expect(result.hasMore).toBe(true);
        expect(result.data).toHaveLength(limit);
    });
});
