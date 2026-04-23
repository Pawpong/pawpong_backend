import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { DeleteInquiryUseCase } from '../../../application/use-cases/delete-inquiry.use-case';
import { InquiryCommandPolicyService } from '../../../domain/services/inquiry-command-policy.service';

describe('문의 삭제 유스케이스', () => {
    const inquiryCommand = {
        findInquiryById: jest.fn(),
        delete: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new DeleteInquiryUseCase(inquiryCommand as any, new InquiryCommandPolicyService(), logger as any);

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

    it('본인 문의를 정상 삭제한다', async () => {
        inquiryCommand.findInquiryById.mockResolvedValue(mockInquiry);
        inquiryCommand.delete.mockResolvedValue(undefined);

        await expect(useCase.execute('inquiry-1', 'user-1')).resolves.toBeUndefined();
    });

    it('문의가 없으면 DomainNotFoundError를 던진다', async () => {
        inquiryCommand.findInquiryById.mockResolvedValue(null);

        await expect(useCase.execute('inquiry-1', 'user-1')).rejects.toThrow(DomainNotFoundError);
    });

    it('답변이 달린 문의는 DomainValidationError를 던진다', async () => {
        inquiryCommand.findInquiryById.mockResolvedValue({
            ...mockInquiry,
            answerCount: 1,
        });

        await expect(useCase.execute('inquiry-1', 'user-1')).rejects.toThrow(DomainValidationError);
    });
});
