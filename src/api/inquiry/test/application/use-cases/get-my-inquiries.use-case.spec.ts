import { GetMyInquiriesUseCase } from '../../../application/use-cases/get-my-inquiries.use-case';
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

describe('내 문의 목록 조회 유스케이스', () => {
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

    const useCase = new GetMyInquiriesUseCase(
        inquiryReader as any,
        new InquiryViewService(),
        inquiryAssetUrl as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('사용자 ID에 해당하는 문의 목록을 반환한다', async () => {
        inquiryReader.readMyList.mockResolvedValue([makeInquirySnapshot({ authorId: 'user-abc' })]);

        const result = await useCase.execute('user-abc');

        expect(result.data).toHaveLength(1);
    });

    it('문의가 없으면 빈 배열을 반환한다', async () => {
        inquiryReader.readMyList.mockResolvedValue([]);

        const result = await useCase.execute('user-abc');

        expect(result.data).toEqual([]);
        expect(result.hasMore).toBe(false);
    });

    it('authorId를 리더에게 정확히 전달한다', async () => {
        inquiryReader.readMyList.mockResolvedValue([]);

        await useCase.execute('user-xyz');

        expect(inquiryReader.readMyList).toHaveBeenCalledWith(
            expect.objectContaining({ authorId: 'user-xyz' }),
        );
    });

    it('animalType 필터를 리더에게 전달한다', async () => {
        inquiryReader.readMyList.mockResolvedValue([]);

        await useCase.execute('user-abc', 1, 15, 'dog');

        expect(inquiryReader.readMyList).toHaveBeenCalledWith(
            expect.objectContaining({ animalType: 'dog' }),
        );
    });

    it('다음 페이지가 있으면 hasMore가 true다', async () => {
        const limit = 5;
        inquiryReader.readMyList.mockResolvedValue(
            Array.from({ length: limit + 1 }, (_, i) => makeInquirySnapshot({ id: `inquiry-${i}` })),
        );

        const result = await useCase.execute('user-abc', 1, limit);

        expect(result.hasMore).toBe(true);
        expect(result.data).toHaveLength(limit);
    });
});
