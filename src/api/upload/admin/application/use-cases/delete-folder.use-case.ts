import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { UploadAdminStoragePolicyService } from '../../domain/services/upload-admin-storage-policy.service';
import type { DeleteMultipleUploadAdminFilesCommandPort } from '../ports/upload-admin-file-orchestration.port';
import {
    DELETE_MULTIPLE_UPLOAD_ADMIN_FILES_COMMAND,
} from '../tokens/upload-admin-file-orchestration.token';
import { UPLOAD_ADMIN_STORAGE_PORT, type UploadAdminStoragePort } from '../ports/upload-admin-storage.port';
import type { UploadAdminDeleteFilesResult } from '../types/upload-admin-result.type';

@Injectable()
export class DeleteFolderUseCase {
    constructor(
        @Inject(UPLOAD_ADMIN_STORAGE_PORT)
        private readonly uploadAdminStorage: UploadAdminStoragePort,
        private readonly uploadAdminStoragePolicyService: UploadAdminStoragePolicyService,
        @Inject(DELETE_MULTIPLE_UPLOAD_ADMIN_FILES_COMMAND)
        private readonly deleteMultipleFilesUseCase: DeleteMultipleUploadAdminFilesCommandPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(folder: string): Promise<UploadAdminDeleteFilesResult> {
        this.logger.logStart('deleteFolder', '폴더 전체 삭제 시작', { folder });

        const prefix = this.uploadAdminStoragePolicyService.normalizeFolderPrefix(folder);
        const fileNames = (await this.uploadAdminStorage.list(prefix, 1000)).files.map((file) => file.key);
        this.uploadAdminStoragePolicyService.ensureFileNames(fileNames);

        const result = await this.deleteMultipleFilesUseCase.execute(fileNames);
        this.logger.logSuccess('deleteFolder', '폴더 삭제 완료', result);

        return result;
    }
}
