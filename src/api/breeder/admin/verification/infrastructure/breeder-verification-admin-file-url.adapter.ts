import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../../../common/storage/storage.service';
import type { BreederVerificationAdminFileUrlPort } from '../application/ports/breeder-verification-admin-file-url.port';

@Injectable()
export class BreederVerificationAdminFileUrlAdapter implements BreederVerificationAdminFileUrlPort {
    constructor(private readonly storageService: StorageService) {}

    generateOne(fileName: string, expirationMinutes: number = 60): string {
        return this.storageService.generateSignedUrl(fileName, expirationMinutes);
    }
}
