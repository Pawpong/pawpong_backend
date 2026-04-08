import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../../common/storage/storage.service';
import { FeedVideoFileStoragePort } from '../application/ports/feed-video-file-storage.port';

@Injectable()
export class FeedVideoStorageAdapter implements FeedVideoFileStoragePort {
    constructor(private readonly storageService: StorageService) {}

    generatePresignedUploadUrl(fileKey: string, expiresInSeconds: number): Promise<string> {
        return this.storageService.generatePresignedUploadUrl(fileKey, expiresInSeconds);
    }

    deleteFile(fileKey: string): Promise<void> {
        return this.storageService.deleteFile(fileKey);
    }
}
