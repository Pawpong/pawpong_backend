import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { UpdateInquiryUseCase } from '../../../application/use-cases/update-inquiry.use-case';
import { InquiryCommandPolicyService } from '../../../domain/services/inquiry-command-policy.service';

describe('문의 수정 유스케이스', () => {
    const inquiryCommand = {
        findInquiryById: jest.fn(),
        update: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new UpdateInquiryUseCase(inquiryCommand as any, new InquiryCommandPolicyService(), logger as any);

    const mockInquiry = {
        id: 'inquiry-1',
        authorId: 'user-1',
        type: 'common',
        animalType: 'dog',
        status: 'active',
        answerCount: 0,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('본인 문의를 정상 수정한다', async () => {
        inquiryCommand.findInquiryById.mockResolvedValue(mockInquiry);
        inquiryCommand.update.mockResolvedValue(undefined);

        await expect(useCase.execute('inquiry-1', 'user-1', { title: '수정 제목' })).resolves.toBeUndefined();
    });

    it('문의가 없으면 DomainNotFoundError를 던진다', async () => {
        inquiryCommand.findInquiryById.mockResolvedValue(null);

        await expect(useCase.execute('inquiry-1', 'user-1', { title: '수정 제목' })).rejects.toThrow(
            DomainNotFoundError,
        );
    });

    it('본인 문의가 아니면 DomainValidationError를 던진다', async () => {
        inquiryCommand.findInquiryById.mockResolvedValue({
            ...mockInquiry,
            authorId: 'other-user',
        });

        await expect(useCase.execute('inquiry-1', 'user-1', { title: '수정 제목' })).rejects.toThrow(
            DomainValidationError,
        );
    });
});
