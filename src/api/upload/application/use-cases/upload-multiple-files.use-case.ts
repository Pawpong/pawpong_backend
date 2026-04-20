import { Inject, Injectable } from '@nestjs/common';

import { UPLOAD_FILE_STORE_PORT } from '../ports/upload-file-store.port';
import type { UploadFileStorePort } from '../ports/upload-file-store.port';
import { UploadFilePolicyService } from '../../domain/services/upload-file-policy.service';
import { UploadResultMapperService } from '../../domain/services/upload-result-mapper.service';
import type { UploadFileResult } from '../types/upload-result.type';

@Injectable()
export class UploadMultipleFilesUseCase {
    constructor(
        @Inject(UPLOAD_FILE_STORE_PORT) private readonly fileStore: UploadFileStorePort,
        private readonly uploadFilePolicy: UploadFilePolicyService,
        private readonly uploadResultMapperService: UploadResultMapperService,
    ) {}

    async execute(files: Express.Multer.File[], folder?: string): Promise<UploadFileResult[]> {
        this.uploadFilePolicy.ensurePublicMultipleFiles(files);

        const resources = await this.fileStore.uploadFiles(files, folder);
        return this.uploadResultMapperService.toResults(resources, files);
    }
}
