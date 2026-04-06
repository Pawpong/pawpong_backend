import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { UploadAdminStoragePolicyService } from '../../domain/services/upload-admin-storage-policy.service';
import { UPLOAD_ADMIN_STORAGE, type UploadAdminStoragePort } from '../ports/upload-admin-storage.port';

@Injectable()
export class DeleteFileUseCase {
    constructor(
        @Inject(UPLOAD_ADMIN_STORAGE)
        private readonly uploadAdminStorage: UploadAdminStoragePort,
        private readonly uploadAdminStoragePolicyService: UploadAdminStoragePolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(fileName: string): Promise<void> {
        this.logger.logStart('deleteFile', '파일 삭제 시작', { fileName });
        this.uploadAdminStoragePolicyService.ensureFileName(fileName);

        try {
            await this.uploadAdminStorage.delete(fileName);
            this.logger.logSuccess('deleteFile', '파일 삭제 완료', { fileName });
        } catch (error) {
            this.logger.logError('deleteFile', '파일 삭제 실패', error);
            throw new BadRequestException('파일을 삭제할 수 없습니다.');
        }
    }
}
