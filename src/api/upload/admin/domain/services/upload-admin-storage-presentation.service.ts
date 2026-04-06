import { Injectable } from '@nestjs/common';

import { StorageFileResponseDto } from '../../dto/response/storage-file-response.dto';
import { StorageListResponseDto } from '../../dto/response/storage-list-response.dto';
import { UploadAdminStoredObjectSnapshot } from '../../application/ports/upload-admin-storage.port';

@Injectable()
export class UploadAdminStoragePresentationService {
    toListResponseDto(files: UploadAdminStoredObjectSnapshot[], isTruncated: boolean): StorageListResponseDto {
        const items = files.map((file) => this.toFileResponseDto(file));

        return {
            files: items,
            totalFiles: items.length,
            folderStats: this.calculateFolderStats(items),
            isTruncated,
        };
    }

    private toFileResponseDto(file: UploadAdminStoredObjectSnapshot): StorageFileResponseDto {
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
        files: StorageFileResponseDto[],
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
