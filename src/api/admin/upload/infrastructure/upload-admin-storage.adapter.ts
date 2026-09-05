import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../../common/storage/storage.service';
import {
    UploadAdminStorageListSnapshot,
    UploadAdminStoragePort,
    UploadAdminStoredObjectSnapshot,
} from '../application/ports/upload-admin-storage.port';

@Injectable()
export class UploadAdminStorageAdapter implements UploadAdminStoragePort {
    constructor(private readonly storageService: StorageService) {}

    async list(prefix?: string, maxKeys: number = 1000): Promise<UploadAdminStorageListSnapshot> {
        const result = await this.storageService.listObjects(prefix, maxKeys);

        return {
            files:
                result.Contents?.map(
                    (item): UploadAdminStoredObjectSnapshot => ({
                        key: item.Key || '',
                        size: item.Size || 0,
                        lastModified: item.LastModified || new Date(),
                        url: this.storageService.getCdnUrl(item.Key || ''),
                    }),
                ) || [],
            isTruncated: result.IsTruncated || false,
        };
    }

    delete(fileName: string): Promise<void> {
        return this.storageService.deleteFile(fileName);
    }
}
