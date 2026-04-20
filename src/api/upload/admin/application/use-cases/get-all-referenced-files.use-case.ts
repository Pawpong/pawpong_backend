import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import {
    UPLOAD_ADMIN_REFERENCE_READER_PORT,
    type UploadAdminReferenceReaderPort,
} from '../ports/upload-admin-reference-reader.port';

@Injectable()
export class GetAllReferencedFilesUseCase {
    constructor(
        @Inject(UPLOAD_ADMIN_REFERENCE_READER_PORT)
        private readonly uploadAdminReferenceReader: UploadAdminReferenceReaderPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(): Promise<string[]> {
        this.logger.logStart('getAllReferencedFiles', 'DB 참조 파일 전체 조회 시작');

        const referencedFiles = await this.uploadAdminReferenceReader.readAllReferencedFiles();

        this.logger.logSuccess('getAllReferencedFiles', 'DB 참조 파일 조회 완료', {
            totalReferencedFiles: referencedFiles.length,
        });

        return referencedFiles;
    }
}
