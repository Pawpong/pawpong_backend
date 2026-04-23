import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { CreateInquiryAnswerUseCase } from '../../../application/use-cases/create-inquiry-answer.use-case';
import { InquiryCommandPolicyService } from '../../../domain/services/inquiry-command-policy.service';

describe('문의 답변 작성 유스케이스', () => {
    const inquiryCommand = {
        findInquiryById: jest.fn(),
        findBreederInfo: jest.fn(),
        appendAnswer: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new CreateInquiryAnswerUseCase(
        inquiryCommand as any,
        new InquiryCommandPolicyService(),
        logger as any,
    );

    const mockInquiry = {
        id: 'inquiry-1',
        authorId: 'user-1',
        type: 'direct',
        animalType: 'dog',
        targetBreederId: 'breeder-1',
        status: 'active',
        answerCount: 0,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('브리더 답변을 정상 등록한다', async () => {
        inquiryCommand.findInquiryById.mockResolvedValue(mockInquiry);
        inquiryCommand.findBreederInfo.mockResolvedValue({
            name: '브리더',
            profileImageFileName: 'profile.jpg',
            petType: 'dog',
            breeds: ['말티즈'],
        });
        inquiryCommand.appendAnswer.mockResolvedValue(undefined);

        await expect(
            useCase.execute('inquiry-1', 'breeder-1', { content: '답변 내용', imageUrls: [] }),
        ).resolves.toBeUndefined();
    });

    it('필수 정보가 누락되면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('', 'breeder-1', { content: '답변 내용', imageUrls: [] })).rejects.toThrow(
            DomainValidationError,
        );
    });

    it('문의가 없으면 DomainNotFoundError를 던진다', async () => {
        inquiryCommand.findInquiryById.mockResolvedValue(null);

        await expect(
            useCase.execute('inquiry-1', 'breeder-1', { content: '답변 내용', imageUrls: [] }),
        ).rejects.toThrow(DomainNotFoundError);
    });

    it('브리더 정보가 없으면 DomainNotFoundError를 던진다', async () => {
        inquiryCommand.findInquiryById.mockResolvedValue(mockInquiry);
        inquiryCommand.findBreederInfo.mockResolvedValue(null);

        await expect(
            useCase.execute('inquiry-1', 'breeder-1', { content: '답변 내용', imageUrls: [] }),
        ).rejects.toThrow(DomainNotFoundError);
    });
});
