import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../../common/storage/storage.service';
import type { ProfileAssetUrlPort } from '../application/ports/profile-asset-url.port';

@Injectable()
export class ProfileAssetUrlStorageAdapter implements ProfileAssetUrlPort {
    constructor(private readonly storage: StorageService) {}

    toProfileImageUrl(fileName?: string | null): string | undefined {
        if (!fileName || fileName.trim().length === 0) return undefined;
        return this.storage.generateSignedUrl(fileName);
    }

    toPhotoUrls(fileNames?: string[] | null): string[] {
        if (!fileNames?.length) return [];
        // 빈 문자열이 섞여 들어와도 깨진 이미지가 노출되지 않도록 걸러낸다.
        return fileNames
            .map((fileName) => this.toProfileImageUrl(fileName))
            .filter((url): url is string => Boolean(url));
    }
}
