import { Injectable } from '@nestjs/common';

import { UploadAdminStoredObjectSnapshot } from '../../application/ports/upload-admin-storage.port';
import type {
    UploadAdminStorageFileResult,
    UploadAdminStorageListResult,
} from '../../application/types/upload-admin-result.type';

@Injectable()
export class UploadAdminStorageListAssemblerService {
    build(files: UploadAdminStoredObjectSnapshot[], isTruncated: boolean): UploadAdminStorageListResult {
        const items = files.map((file) => this.toFileResult(file));

        return {
            files: items,
            totalFiles: items.length,
            folderStats: this.calculateFolderStats(items),
            isTruncated,
        };
    }

    private toFileResult(file: UploadAdminStoredObjectSnapshot): UploadAdminStorageFileResult {
        return {
            key: file.key,
            size: file.size,
            lastModified: file.lastModified,
            url: file.url,
            folder: this.extractFolder(file.key),
        };
    }

    private extractFolder(key: string): string {
        const parts = key.split('/');
        return parts.length > 1 ? parts[0] : 'root';
    }

    private calculateFolderStats(
        files: UploadAdminStorageFileResult[],
    ): Record<string, { count: number; totalSize: number }> {
        const stats: Record<string, { count: number; totalSize: number }> = {};

        for (const file of files) {
            if (!stats[file.folder]) {
                stats[file.folder] = { count: 0, totalSize: 0 };
            }

            stats[file.folder].count++;
            stats[file.folder].totalSize += file.size;
        }

        return stats;
    }
}
