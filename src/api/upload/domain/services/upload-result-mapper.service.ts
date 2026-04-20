import { Injectable } from '@nestjs/common';

import type { StoredUploadResource } from '../../application/ports/upload-file-store.port';
import type { UploadFileResult } from '../../application/types/upload-result.type';

@Injectable()
export class UploadResultMapperService {
    toResult(resource: StoredUploadResource, file: Express.Multer.File): UploadFileResult {
        return {
            url: resource.cdnUrl,
            cdnUrl: resource.cdnUrl,
            filename: resource.fileName,
            fileName: resource.fileName,
            size: file.size,
        };
    }

    toResults(resources: StoredUploadResource[], files: Express.Multer.File[]): UploadFileResult[] {
        return resources.map((resource, index) => this.toResult(resource, files[index]));
    }
}
