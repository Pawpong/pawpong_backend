import { Inject, Injectable } from '@nestjs/common';

import { UPLOAD_FILE_STORE_PORT } from '../ports/upload-file-store.port';
import type { UploadFileStorePort } from '../ports/upload-file-store.port';
import { UploadResponseMapper } from '../mappers/upload-response.mapper';
import { UploadFilePolicyService } from '../../domain/services/upload-file-policy.service';
import type { UploadFileResult } from '../types/upload-result.type';

@Injectable()
export class UploadSingleFileUseCase {
    constructor(
        @Inject(UPLOAD_FILE_STORE_PORT) private readonly fileStore: UploadFileStorePort,
        private readonly uploadFilePolicy: UploadFilePolicyService,
    ) {}

    async execute(file: Express.Multer.File, folder?: string): Promise<UploadFileResult> {
        this.uploadFilePolicy.ensurePublicSingleFile(file);

        const resource = await this.fileStore.uploadFile(file, folder);
        return UploadResponseMapper.toResult(resource, file);
    }
}
