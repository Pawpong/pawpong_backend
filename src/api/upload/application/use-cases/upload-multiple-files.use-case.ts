import { Inject, Injectable } from '@nestjs/common';

import { UploadResponseDto } from '../../dto/response/upload-response.dto';
import { UPLOAD_FILE_STORE } from '../ports/upload-file-store.port';
import type { UploadFileStorePort } from '../ports/upload-file-store.port';
import { UploadResponseMapper } from '../mappers/upload-response.mapper';
import { UploadFilePolicyService } from '../../domain/services/upload-file-policy.service';

@Injectable()
export class UploadMultipleFilesUseCase {
    constructor(
        @Inject(UPLOAD_FILE_STORE) private readonly fileStore: UploadFileStorePort,
        private readonly uploadFilePolicy: UploadFilePolicyService,
    ) {}

    async execute(files: Express.Multer.File[], folder?: string): Promise<UploadResponseDto[]> {
        this.uploadFilePolicy.ensurePublicMultipleFiles(files);

        const resources = await this.fileStore.uploadFiles(files, folder);
        return UploadResponseMapper.toDtos(resources, files);
    }
}
