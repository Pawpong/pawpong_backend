import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { GetInquiryDetailUseCase } from '../../../application/use-cases/get-inquiry-detail.use-case';
import { InquiryViewService } from '../../../domain/services/inquiry-view.service';

describe('문의 상세 조회 유스케이스', () => {
    const inquiryReader = {
        readDetail: jest.fn(),
        incrementViewCount: jest.fn(),
    };
    const inquiryAssetUrl = {
        generateSignedUrl: jest.fn((fileName: string) => `signed:${fileName}`),
    };

    const useCase = new GetInquiryDetailUseCase(inquiryReader as any, new InquiryViewService(), inquiryAssetUrl as any);

    const mockInquiry = {
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
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('문의 상세를 정상 조회한다', async () => {
        inquiryReader.readDetail.mockResolvedValue(mockInquiry);

        const result = await useCase.execute('inquiry-1', 'user-1');

        expect(result.id).toBe('inquiry-1');
        expect(inquiryReader.incrementViewCount).toHaveBeenCalledWith('inquiry-1');
    });

    it('문의 ID가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('')).rejects.toThrow(DomainValidationError);
    });

    it('문의가 없으면 DomainNotFoundError를 던진다', async () => {
        inquiryReader.readDetail.mockResolvedValue(null);

        await expect(useCase.execute('inquiry-1')).rejects.toThrow(DomainNotFoundError);
    });
});
