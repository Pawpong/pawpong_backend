import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import { HomeAssetUrlPort } from '../application/ports/home-asset-url.port';

@Injectable()
export class HomeStorageAssetUrlAdapter implements HomeAssetUrlPort {
    constructor(private readonly storageService: StorageService) {}

    generateSignedUrl(fileName: string, expirationMinutes?: number): string {
        return this.storageService.generateSignedUrl(fileName, expirationMinutes);
    }
}
