import { Injectable } from '@nestjs/common';

import { StorageListResponseDto } from '../../dto/response/storage-list-response.dto';
import { UploadAdminStoragePolicyService } from '../../domain/services/upload-admin-storage-policy.service';
import { ListAllFilesUseCase } from './list-all-files.use-case';

@Injectable()
export class ListFilesByFolderUseCase {
    constructor(
        private readonly uploadAdminStoragePolicyService: UploadAdminStoragePolicyService,
        private readonly listAllFilesUseCase: ListAllFilesUseCase,
    ) {}

    async execute(folder: string): Promise<StorageListResponseDto> {
        const prefix = this.uploadAdminStoragePolicyService.normalizeFolderPrefix(folder);
        return this.listAllFilesUseCase.execute(prefix);
    }
}
