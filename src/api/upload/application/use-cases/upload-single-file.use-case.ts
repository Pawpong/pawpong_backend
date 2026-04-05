import { Inject, Injectable } from '@nestjs/common';

import { UploadResponseDto } from '../../dto/response/upload-response.dto';
import { UPLOAD_FILE_STORE } from '../ports/upload-file-store.port';
import type { UploadFileStorePort } from '../ports/upload-file-store.port';
import { UploadResponseMapper } from '../mappers/upload-response.mapper';
import { UploadFilePolicyService } from '../../domain/services/upload-file-policy.service';

@Injectable()
export class UploadSingleFileUseCase {
    constructor(
        @Inject(UPLOAD_FILE_STORE) private readonly fileStore: UploadFileStorePort,
        private readonly uploadFilePolicy: UploadFilePolicyService,
    ) {}

    async execute(file: Express.Multer.File, folder?: string): Promise<UploadResponseDto> {
        this.uploadFilePolicy.ensurePublicSingleFile(file);

        const resource = await this.fileStore.uploadFile(file, folder);
        return UploadResponseMapper.toDto(resource, file);
    }
}
