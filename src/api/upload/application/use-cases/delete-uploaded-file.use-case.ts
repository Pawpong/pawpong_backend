import { Inject, Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../common/error/domain.error';

import { UPLOAD_FILE_STORE_PORT } from '../ports/upload-file-store.port';
import type { UploadFileStorePort } from '../ports/upload-file-store.port';

@Injectable()
export class DeleteUploadedFileUseCase {
    constructor(@Inject(UPLOAD_FILE_STORE_PORT) private readonly fileStore: UploadFileStorePort) {}

    async execute(fileName: string): Promise<void> {
        if (!fileName) {
            throw new DomainValidationError('파일명이 없습니다.');
        }

        await this.fileStore.deleteFile(fileName);
    }
}
