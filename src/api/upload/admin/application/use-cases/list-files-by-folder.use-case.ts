import { Inject, Injectable } from '@nestjs/common';

import { StorageListResponseDto } from '../../dto/response/storage-list-response.dto';
import { UploadAdminStoragePolicyService } from '../../domain/services/upload-admin-storage-policy.service';
import {
    LIST_ALL_UPLOAD_ADMIN_FILES_QUERY,
    type ListAllUploadAdminFilesQueryPort,
} from '../ports/upload-admin-file-orchestration.port';

@Injectable()
export class ListFilesByFolderUseCase {
    constructor(
        private readonly uploadAdminStoragePolicyService: UploadAdminStoragePolicyService,
        @Inject(LIST_ALL_UPLOAD_ADMIN_FILES_QUERY)
        private readonly listAllFilesUseCase: ListAllUploadAdminFilesQueryPort,
    ) {}

    async execute(folder: string): Promise<StorageListResponseDto> {
        const prefix = this.uploadAdminStoragePolicyService.normalizeFolderPrefix(folder);
        return this.listAllFilesUseCase.execute(prefix);
    }
}
