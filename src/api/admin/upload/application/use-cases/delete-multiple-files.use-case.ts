import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { UploadAdminStoragePolicyService } from '../../domain/services/upload-admin-storage-policy.service';
import { UPLOAD_ADMIN_STORAGE_PORT, type UploadAdminStoragePort } from '../ports/upload-admin-storage.port';
import type { UploadAdminDeleteFilesResult } from '../types/upload-admin-result.type';

@Injectable()
export class DeleteMultipleFilesUseCase {
    constructor(
        @Inject(UPLOAD_ADMIN_STORAGE_PORT)
        private readonly uploadAdminStorage: UploadAdminStoragePort,
        private readonly uploadAdminStoragePolicyService: UploadAdminStoragePolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(fileNames: string[]): Promise<UploadAdminDeleteFilesResult> {
        this.logger.logStart('deleteMultipleFiles', '다중 파일 삭제 시작', { count: fileNames.length });
        this.uploadAdminStoragePolicyService.ensureFileNames(fileNames);

        const failedFiles: string[] = [];
        let deletedCount = 0;

        for (const fileName of fileNames) {
            try {
                await this.uploadAdminStorage.delete(fileName);
                deletedCount++;
            } catch (error) {
                this.logger.logWarning('deleteMultipleFiles', `파일 삭제 실패: ${fileName}`, { error });
                failedFiles.push(fileName);
            }
        }

        this.logger.logSuccess('deleteMultipleFiles', '다중 파일 삭제 완료', {
            deletedCount,
            failedCount: failedFiles.length,
        });

        return { deletedCount, failedFiles };
    }
}
