import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import { AdopterFileUrlPort } from '../application/ports/adopter-file-url.port';

@Injectable()
export class AdopterFileUrlAdapter implements AdopterFileUrlPort {
    constructor(private readonly storageService: StorageService) {}

    generateOneSafe(fileName: string | null | undefined, expirationMinutes?: number) {
        return this.storageService.generateSignedUrlSafe(fileName, expirationMinutes);
    }

    generateMany(fileNames: string[], expirationMinutes?: number) {
        return this.storageService.generateSignedUrls(fileNames, expirationMinutes);
    }
}
