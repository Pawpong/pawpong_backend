import { DomainValidationError } from '../../../../../common/error/domain.error';
import { UploadAndSubmitAuthBreederDocumentsUseCase } from '../../../application/use-cases/upload-and-submit-auth-breeder-documents.use-case';
import { AuthBreederDocumentSubmissionService } from '../../../domain/services/auth-breeder-document-submission.service';

describe('브리더 인증 문서 업로드 및 제출 유스케이스', () => {
    const authUploadFileStorePort = {
        upload: jest.fn(),
    };
    const submitAuthBreederDocumentsUseCase = {
        execute: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new UploadAndSubmitAuthBreederDocumentsUseCase(
        authUploadFileStorePort as any,
        submitAuthBreederDocumentsUseCase as any,
        new AuthBreederDocumentSubmissionService(),
        logger as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('필수 파일을 업로드한 뒤 제출 유스케이스에 위임한다', async () => {
        authUploadFileStorePort.upload
            .mockResolvedValueOnce({ cdnUrl: 'id-card-url' })
            .mockResolvedValueOnce({ cdnUrl: 'license-url' });
        submitAuthBreederDocumentsUseCase.execute.mockResolvedValue({ breederId: 'breeder-1' });

        const result = await useCase.execute('breeder-1', 'new', {
            idCard: [{ originalname: 'id.png' } as Express.Multer.File],
            animalProductionLicense: [{ originalname: 'license.png' } as Express.Multer.File],
        });

        expect(submitAuthBreederDocumentsUseCase.execute).toHaveBeenCalledWith('breeder-1', 'new', {
            idCardUrl: 'id-card-url',
            animalProductionLicenseUrl: 'license-url',
        });
        expect(result).toEqual({ breederId: 'breeder-1' });
    });

    it('필수 파일이 없으면 예외를 던진다', async () => {
        await expect(
            useCase.execute('breeder-1', 'new', {
                animalProductionLicense: [{ originalname: 'license.png' } as Express.Multer.File],
            }),
        ).rejects.toThrow(new DomainValidationError('신분증 사본 파일이 필요합니다.'));
    });
});
