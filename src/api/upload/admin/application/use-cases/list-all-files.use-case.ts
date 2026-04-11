import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { UploadAdminStoragePresentationService } from '../../domain/services/upload-admin-storage-presentation.service';
import { UPLOAD_ADMIN_STORAGE_PORT, type UploadAdminStoragePort } from '../ports/upload-admin-storage.port';
import type { UploadAdminStorageListResult } from '../types/upload-admin-result.type';

@Injectable()
export class ListAllFilesUseCase {
    constructor(
        @Inject(UPLOAD_ADMIN_STORAGE_PORT)
        private readonly uploadAdminStorage: UploadAdminStoragePort,
        private readonly uploadAdminStoragePresentationService: UploadAdminStoragePresentationService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(prefix?: string): Promise<UploadAdminStorageListResult> {
        this.logger.logStart('listAllFiles', '스토리지 파일 목록 조회 시작', { prefix });

        try {
            const result = await this.uploadAdminStorage.list(prefix, 1000);
            const response = this.uploadAdminStoragePresentationService.toListResult(
                result.files,
                result.isTruncated,
            );

            this.logger.logSuccess('listAllFiles', '파일 목록 조회 완료', {
                totalFiles: response.totalFiles,
                folders: Object.keys(response.folderStats).length,
            });

            return response;
        } catch (error) {
            this.logger.logError('listAllFiles', '파일 목록 조회 실패', error);
            throw new BadRequestException('파일 목록을 조회할 수 없습니다.');
        }
    }
}
