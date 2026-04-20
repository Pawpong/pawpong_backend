import { GetBreederInquiriesUseCase } from '../../../application/use-cases/get-breeder-inquiries.use-case';
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
        viewCount: 5,
        answers: [],
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

describe('브리더 문의 목록 조회 유스케이스', () => {
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

    const useCase = new GetBreederInquiriesUseCase(
        inquiryReader as any,
        new InquiryViewService(),
        inquiryAssetUrl as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('브리더 문의 목록을 반환한다', async () => {
        inquiryReader.readBreederList.mockResolvedValue([makeInquirySnapshot()]);

        const result = await useCase.execute('breeder-1', false);

        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe('inquiry-1');
    });

    it('목록이 없으면 빈 배열을 반환한다', async () => {
        inquiryReader.readBreederList.mockResolvedValue([]);

        const result = await useCase.execute('breeder-1', false);

        expect(result.data).toEqual([]);
        expect(result.hasMore).toBe(false);
    });

    it('페이지 정보에 따라 올바른 skip 값을 전달한다', async () => {
        inquiryReader.readBreederList.mockResolvedValue([]);

        await useCase.execute('breeder-1', false, 3, 10);

        expect(inquiryReader.readBreederList).toHaveBeenCalledWith(
            expect.objectContaining({ skip: 20, limit: 11 }),
        );
    });

    it('limit + 1개보다 많은 데이터가 있으면 hasMore가 true다', async () => {
        const limit = 5;
        const snapshots = Array.from({ length: limit + 1 }, (_, i) =>
            makeInquirySnapshot({ id: `inquiry-${i}` }),
        );
        inquiryReader.readBreederList.mockResolvedValue(snapshots);

        const result = await useCase.execute('breeder-1', false, 1, limit);

        expect(result.hasMore).toBe(true);
        expect(result.data).toHaveLength(limit);
    });

    it('answered 파라미터를 리더에게 그대로 전달한다', async () => {
        inquiryReader.readBreederList.mockResolvedValue([]);

        await useCase.execute('breeder-1', true);

        expect(inquiryReader.readBreederList).toHaveBeenCalledWith(
            expect.objectContaining({ answered: true, breederId: 'breeder-1' }),
        );
    });
});
