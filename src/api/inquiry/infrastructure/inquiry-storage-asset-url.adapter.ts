import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import { InquiryAssetUrlPort } from '../application/ports/inquiry-asset-url.port';

@Injectable()
export class InquiryStorageAssetUrlAdapter implements InquiryAssetUrlPort {
    constructor(private readonly storageService: StorageService) {}

    generateSignedUrl(fileName: string, expirationMinutes?: number): string {
        return this.storageService.generateSignedUrl(fileName, expirationMinutes);
    }
}
