import { Inject, Injectable } from '@nestjs/common';

import { HomeAvailablePetCatalogService } from '../../domain/services/home-available-pet-catalog.service';
import { HOME_ASSET_URL, type HomeAssetUrlPort } from '../ports/home-asset-url.port';
import { HOME_CONTENT_READER, type HomeContentReaderPort } from '../ports/home-content-reader.port';

@Injectable()
export class GetAvailablePetsUseCase {
    constructor(
        @Inject(HOME_CONTENT_READER)
        private readonly homeContentReader: HomeContentReaderPort,
        private readonly homeAvailablePetCatalogService: HomeAvailablePetCatalogService,
        @Inject(HOME_ASSET_URL)
        private readonly homeAssetUrl: HomeAssetUrlPort,
    ) {}

    async execute(limit: number = 10, isAuthenticated: boolean = false): Promise<any[]> {
        const normalizedLimit = this.homeAvailablePetCatalogService.normalizeLimit(limit);
        const pets = await this.homeContentReader.readAvailablePets(normalizedLimit);

        return this.homeAvailablePetCatalogService.buildResponse(pets, isAuthenticated, (fileName, expirationMinutes) =>
            this.homeAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
