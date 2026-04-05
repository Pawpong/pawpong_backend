import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import type { BreederManagementFileUrlPort } from '../application/ports/breeder-management-file-url.port';

@Injectable()
export class BreederManagementFileUrlAdapter implements BreederManagementFileUrlPort {
    constructor(private readonly storageService: StorageService) {}

    generateOne(fileName: string, expirationMinutes: number = 60): string {
        return this.storageService.generateSignedUrl(fileName, expirationMinutes);
    }

    generateOneSafe(fileName: string | null | undefined, expirationMinutes: number = 60): string | undefined {
        return this.storageService.generateSignedUrlSafe(fileName, expirationMinutes);
    }

    generateMany(fileNames: string[], expirationMinutes: number = 60): string[] {
        return this.storageService.generateSignedUrls(fileNames, expirationMinutes);
    }
}
