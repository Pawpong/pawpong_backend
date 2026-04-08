import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { DeleteFilesResponseDto } from '../../dto/response/delete-files-response.dto';
import { UploadAdminStoragePolicyService } from '../../domain/services/upload-admin-storage-policy.service';
import {
    DELETE_MULTIPLE_UPLOAD_ADMIN_FILES_COMMAND,
    type DeleteMultipleUploadAdminFilesCommandPort,
} from '../ports/upload-admin-file-orchestration.port';
import { UPLOAD_ADMIN_STORAGE, type UploadAdminStoragePort } from '../ports/upload-admin-storage.port';

@Injectable()
export class DeleteFolderUseCase {
    constructor(
        @Inject(UPLOAD_ADMIN_STORAGE)
        private readonly uploadAdminStorage: UploadAdminStoragePort,
        private readonly uploadAdminStoragePolicyService: UploadAdminStoragePolicyService,
        @Inject(DELETE_MULTIPLE_UPLOAD_ADMIN_FILES_COMMAND)
        private readonly deleteMultipleFilesUseCase: DeleteMultipleUploadAdminFilesCommandPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(folder: string): Promise<DeleteFilesResponseDto> {
        this.logger.logStart('deleteFolder', '폴더 전체 삭제 시작', { folder });

        const prefix = this.uploadAdminStoragePolicyService.normalizeFolderPrefix(folder);
        const { files } = await this.uploadAdminStorage.list(prefix, 1000);

        if (files.length === 0) {
            throw new BadRequestException('삭제할 파일이 없습니다.');
        }

        const result = await this.deleteMultipleFilesUseCase.execute(files.map((file) => file.key));
        this.logger.logSuccess('deleteFolder', '폴더 삭제 완료', result);

        return result;
    }
}
