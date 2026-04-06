import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { FileReferenceDto, FileReferenceResponseDto } from '../../dto/response/file-reference-response.dto';
import {
    UPLOAD_ADMIN_REFERENCE_READER,
    type UploadAdminReferenceReaderPort,
} from '../ports/upload-admin-reference-reader.port';

@Injectable()
export class CheckFileReferencesUseCase {
    constructor(
        @Inject(UPLOAD_ADMIN_REFERENCE_READER)
        private readonly uploadAdminReferenceReader: UploadAdminReferenceReaderPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(fileKeys: string[]): Promise<FileReferenceResponseDto> {
        this.logger.logStart('checkFileReferences', 'DB 참조 확인 시작', { count: fileKeys.length });

        const files: FileReferenceDto[] = [];
        let referencedCount = 0;
        let orphanedCount = 0;

        for (const fileKey of fileKeys) {
            const references = await this.uploadAdminReferenceReader.findReferences(fileKey);
            const isReferenced = references.length > 0;

            if (isReferenced) {
                referencedCount++;
            } else {
                orphanedCount++;
            }

            files.push({
                fileKey,
                isReferenced,
                references,
            });
        }

        this.logger.logSuccess('checkFileReferences', 'DB 참조 확인 완료', {
            total: fileKeys.length,
            referenced: referencedCount,
            orphaned: orphanedCount,
        });

        return {
            files,
            referencedCount,
            orphanedCount,
        };
    }
}
