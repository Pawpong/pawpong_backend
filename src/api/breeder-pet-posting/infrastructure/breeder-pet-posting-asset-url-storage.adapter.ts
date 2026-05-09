import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import type { BreederPetPostingAssetUrlPort } from '../application/ports/breeder-pet-posting-asset-url.port';

@Injectable()
export class BreederPetPostingAssetUrlStorageAdapter implements BreederPetPostingAssetUrlPort {
    constructor(private readonly storage: StorageService) {}

    toSignedUrl(fileName: string): string {
        if (!fileName) return '';
        return this.storage.generateSignedUrl(fileName);
    }
}
