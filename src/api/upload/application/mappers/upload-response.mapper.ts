import { StoredUploadResource } from '../ports/upload-file-store.port';
import type { UploadFileResult } from '../types/upload-result.type';

export class UploadResponseMapper {
    static toResult(resource: StoredUploadResource, file: Express.Multer.File): UploadFileResult {
        return {
            url: resource.cdnUrl,
            cdnUrl: resource.cdnUrl,
            filename: resource.fileName,
            fileName: resource.fileName,
            size: file.size,
        };
    }

    static toResults(resources: StoredUploadResource[], files: Express.Multer.File[]): UploadFileResult[] {
        return resources.map((resource, index) => this.toResult(resource, files[index]));
    }
}
