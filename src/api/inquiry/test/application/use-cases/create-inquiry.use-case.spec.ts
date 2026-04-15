import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { CreateInquiryUseCase } from '../../../application/use-cases/create-inquiry.use-case';
import { InquiryCommandPolicyService } from '../../../domain/services/inquiry-command-policy.service';

describe('문의 작성 유스케이스', () => {
    const inquiryCommand = {
        findAdopterNickname: jest.fn(),
        existsBreeder: jest.fn(),
        create: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new CreateInquiryUseCase(
        inquiryCommand as any,
        new InquiryCommandPolicyService(),
        logger as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('공개 문의를 정상 생성한다', async () => {
        inquiryCommand.findAdopterNickname.mockResolvedValue('입양자');
        inquiryCommand.create.mockResolvedValue({ inquiryId: 'inquiry-1' });

        await expect(
            useCase.execute('user-1', {
                title: '문의 제목',
                content: '문의 내용',
                type: 'common',
                animalType: 'dog',
            }),
        ).resolves.toEqual({ inquiryId: 'inquiry-1' });
    });

    it('사용자 정보가 없으면 DomainValidationError를 던진다', async () => {
        await expect(
            useCase.execute('', {
                title: '문의 제목',
                content: '문의 내용',
                type: 'common',
                animalType: 'dog',
            }),
        ).rejects.toThrow(DomainValidationError);
    });

    it('입양자 정보가 없으면 DomainNotFoundError를 던진다', async () => {
        inquiryCommand.findAdopterNickname.mockResolvedValue(null);

        await expect(
            useCase.execute('user-1', {
                title: '문의 제목',
                content: '문의 내용',
                type: 'common',
                animalType: 'dog',
            }),
        ).rejects.toThrow(DomainNotFoundError);
    });

    it('1:1 문의 대상 브리더가 없으면 DomainNotFoundError를 던진다', async () => {
        inquiryCommand.findAdopterNickname.mockResolvedValue('입양자');
        inquiryCommand.existsBreeder.mockResolvedValue(false);

        await expect(
            useCase.execute('user-1', {
                title: '문의 제목',
                content: '문의 내용',
                type: 'direct',
                animalType: 'dog',
                targetBreederId: 'breeder-1',
            }),
        ).rejects.toThrow(DomainNotFoundError);
    });
});
