import { DomainValidationError } from '../../../../../common/error/domain.error';
import { DeleteUploadedFileUseCase } from '../../../application/use-cases/delete-uploaded-file.use-case';
import type { UploadFileStorePort } from '../../../application/ports/upload-file-store.port';

describe('업로드 파일 삭제 유스케이스', () => {
    it('파일명이 없으면 도메인 검증 예외를 던진다', async () => {
        const fileStore: UploadFileStorePort = {
            uploadFile: jest.fn(),
            uploadFiles: jest.fn(),
            deleteFile: jest.fn(),
            getBucketName: jest.fn(),
        };
        const useCase = new DeleteUploadedFileUseCase(fileStore);

        await expect(useCase.execute('')).rejects.toBeInstanceOf(DomainValidationError);
        expect(fileStore.deleteFile).not.toHaveBeenCalled();
    });

    it('파일명이 있으면 스토리지 삭제를 수행한다', async () => {
        const fileStore: UploadFileStorePort = {
            uploadFile: jest.fn(),
            uploadFiles: jest.fn(),
            deleteFile: jest.fn().mockResolvedValue(undefined),
            getBucketName: jest.fn(),
        };
        const useCase = new DeleteUploadedFileUseCase(fileStore);

        await expect(useCase.execute('test/file.jpg')).resolves.toBeUndefined();
        expect(fileStore.deleteFile).toHaveBeenCalledWith('test/file.jpg');
    });
});
