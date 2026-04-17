import { DomainValidationError } from '../../../../../common/error/domain.error';
import { UploadSingleFileUseCase } from '../../../application/use-cases/upload-single-file.use-case';
import { UploadFilePolicyService } from '../../../domain/services/upload-file-policy.service';
import { UploadResultMapperService } from '../../../domain/services/upload-result-mapper.service';
import { UploadFileStorePort } from '../../../application/ports/upload-file-store.port';

function makeFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
    return {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from(''),
        destination: '',
        filename: 'test.jpg',
        path: '',
        stream: null as any,
        ...overrides,
    };
}

function makeFileStore(): UploadFileStorePort {
    return {
        uploadFile: jest.fn().mockResolvedValue({
            fileName: 'uploads/test.jpg',
            cdnUrl: 'https://cdn.example.com/uploads/test.jpg',
            storageUrl: 'https://storage.example.com/uploads/test.jpg',
        }),
        uploadFiles: jest.fn(),
        deleteFile: jest.fn(),
        getBucketName: jest.fn().mockReturnValue('test-bucket'),
    };
}

describe('단일 파일 업로드 유스케이스', () => {
    const policy = new UploadFilePolicyService();
    const resultMapper = new UploadResultMapperService();

    it('파일을 업로드하고 결과를 반환한다', async () => {
        const useCase = new UploadSingleFileUseCase(makeFileStore(), policy, resultMapper);

        const result = await useCase.execute(makeFile());

        expect(result.fileName).toBe('uploads/test.jpg');
        expect(result.url).toBeDefined();
    });

    it('파일이 없으면 DomainValidationError를 던진다', async () => {
        const useCase = new UploadSingleFileUseCase(makeFileStore(), policy, resultMapper);

        await expect(useCase.execute(undefined as any)).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('folder 파라미터를 전달한다', async () => {
        const store = makeFileStore();
        const useCase = new UploadSingleFileUseCase(store, policy, resultMapper);

        await useCase.execute(makeFile(), 'profile-images');

        expect(store.uploadFile).toHaveBeenCalledWith(expect.anything(), 'profile-images');
    });
});
