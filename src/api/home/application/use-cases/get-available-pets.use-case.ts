import { Inject, Injectable } from '@nestjs/common';

import { StorageService } from '../../../../common/storage/storage.service';
import { HomeAvailablePetCatalogService } from '../../domain/services/home-available-pet-catalog.service';
import { HOME_CONTENT_READER, type HomeContentReaderPort } from '../ports/home-content-reader.port';

@Injectable()
export class GetAvailablePetsUseCase {
    constructor(
        @Inject(HOME_CONTENT_READER)
        private readonly homeContentReader: HomeContentReaderPort,
        private readonly homeAvailablePetCatalogService: HomeAvailablePetCatalogService,
        private readonly storageService: StorageService,
    ) {}

    async execute(limit: number = 10, isAuthenticated: boolean = false): Promise<any[]> {
        const normalizedLimit = this.homeAvailablePetCatalogService.normalizeLimit(limit);
        const pets = await this.homeContentReader.readAvailablePets(normalizedLimit);

        return this.homeAvailablePetCatalogService.buildResponse(pets, isAuthenticated, (fileName, expirationMinutes) =>
            this.storageService.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
