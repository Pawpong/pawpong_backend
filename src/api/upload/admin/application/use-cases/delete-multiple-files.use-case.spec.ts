import { BadRequestException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { UploadAdminStoragePolicyService } from '../../domain/services/upload-admin-storage-policy.service';
import { UploadAdminStoragePort } from '../ports/upload-admin-storage.port';
import { DeleteMultipleFilesUseCase } from './delete-multiple-files.use-case';

describe('DeleteMultipleFilesUseCase', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logWarning: jest.fn(),
    } as unknown as CustomLoggerService;

    it('실패한 파일만 failedFiles에 모은다', async () => {
        const uploadAdminStorage: UploadAdminStoragePort = {
            list: jest.fn(),
            delete: jest
                .fn()
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error('fail')),
        };
        const useCase = new DeleteMultipleFilesUseCase(
            uploadAdminStorage,
            new UploadAdminStoragePolicyService(),
            logger,
        );

        await expect(useCase.execute(['a.jpg', 'b.jpg'])).resolves.toEqual({
            deletedCount: 1,
            failedFiles: ['b.jpg'],
        });
    });

    it('삭제 대상이 없으면 예외를 던진다', async () => {
        const useCase = new DeleteMultipleFilesUseCase(
            {
                list: jest.fn(),
                delete: jest.fn(),
            },
            new UploadAdminStoragePolicyService(),
            logger,
        );

        await expect(useCase.execute([])).rejects.toBeInstanceOf(BadRequestException);
    });
});
