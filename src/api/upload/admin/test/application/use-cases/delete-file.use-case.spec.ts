import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';
import { UploadAdminStoragePolicyService } from '../../../domain/services/upload-admin-storage-policy.service';
import type { UploadAdminStoragePort } from '../../../application/ports/upload-admin-storage.port';
import { DeleteFileUseCase } from '../../../application/use-cases/delete-file.use-case';

describe('관리자 파일 삭제 유스케이스', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('파일명이 유효하면 스토리지 삭제를 수행한다', async () => {
        const uploadAdminStorage: UploadAdminStoragePort = {
            list: jest.fn(),
            delete: jest.fn().mockResolvedValue(undefined),
        };
        const useCase = new DeleteFileUseCase(
            uploadAdminStorage,
            new UploadAdminStoragePolicyService(),
            logger,
        );

        await expect(useCase.execute('folder/file.jpg')).resolves.toBeUndefined();
        expect(uploadAdminStorage.delete).toHaveBeenCalledWith('folder/file.jpg');
    });

    it('예상하지 못한 스토리지 오류는 그대로 전파한다', async () => {
        const uploadAdminStorage: UploadAdminStoragePort = {
            list: jest.fn(),
            delete: jest.fn().mockRejectedValue(new Error('storage down')),
        };
        const useCase = new DeleteFileUseCase(
            uploadAdminStorage,
            new UploadAdminStoragePolicyService(),
            logger,
        );

        await expect(useCase.execute('folder/file.jpg')).rejects.toThrow('storage down');
    });
});
