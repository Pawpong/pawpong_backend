import { DomainValidationError } from '../../../../../common/error/domain.error';
import { UploadMultipleFilesUseCase } from '../../../application/use-cases/upload-multiple-files.use-case';
import { UploadFilePolicyService } from '../../../domain/services/upload-file-policy.service';
import { UploadResultMapperService } from '../../../domain/services/upload-result-mapper.service';
import { UploadFileStorePort } from '../../../application/ports/upload-file-store.port';

function makeFile(name = 'test.jpg'): Express.Multer.File {
    return {
        fieldname: 'files',
        originalname: name,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from(''),
        destination: '',
        filename: name,
        path: '',
        stream: null as any,
    };
}

function makeFileStore(count = 1): UploadFileStorePort {
    return {
        uploadFile: jest.fn(),
        uploadFiles: jest.fn().mockResolvedValue(
            Array.from({ length: count }, (_, i) => ({
                fileName: `uploads/file-${i}.jpg`,
                cdnUrl: `https://cdn.example.com/uploads/file-${i}.jpg`,
                storageUrl: `https://storage.example.com/uploads/file-${i}.jpg`,
            })),
        ),
        deleteFile: jest.fn(),
        getBucketName: jest.fn().mockReturnValue('test-bucket'),
    };
}

describe('다중 파일 업로드 유스케이스', () => {
    const policy = new UploadFilePolicyService();
    const resultMapper = new UploadResultMapperService();

    it('여러 파일을 업로드하고 결과 목록을 반환한다', async () => {
        const files = [makeFile('a.jpg'), makeFile('b.jpg')];
        const useCase = new UploadMultipleFilesUseCase(makeFileStore(2), policy, resultMapper);

        const result = await useCase.execute(files);

        expect(result).toHaveLength(2);
        expect(result[0].fileName).toContain('file-0');
    });

    it('파일이 없으면 DomainValidationError를 던진다', async () => {
        const useCase = new UploadMultipleFilesUseCase(makeFileStore(), policy, resultMapper);

        await expect(useCase.execute([])).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('folder 파라미터를 전달한다', async () => {
        const store = makeFileStore(1);
        const useCase = new UploadMultipleFilesUseCase(store, policy, resultMapper);

        await useCase.execute([makeFile()], 'gallery');

        expect(store.uploadFiles).toHaveBeenCalledWith(expect.anything(), 'gallery');
    });
});
