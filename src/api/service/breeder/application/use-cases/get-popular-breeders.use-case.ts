import { Inject, Injectable } from '@nestjs/common';

import { BREEDER_FILE_URL_PORT } from '../ports/breeder-file-url.port';
import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import type { BreederFileUrlPort } from '../ports/breeder-file-url.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import { BreederExploreCardMapperService } from '../../domain/services/breeder-explore-card-mapper.service';
import type { BreederCardResult } from '../types/breeder-result.type';

@Injectable()
export class GetPopularBreedersUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        @Inject(BREEDER_FILE_URL_PORT)
        private readonly breederFileUrlPort: BreederFileUrlPort,
        private readonly breederExploreCardMapperService: BreederExploreCardMapperService,
    ) {}

    async execute(limit: number = 10): Promise<BreederCardResult[]> {
        const [breeders, availableBreederIds] = await Promise.all([
            this.breederPublicReaderPort.findPopularPublicBreeders(limit),
            this.breederPublicReaderPort.findBreederIdsWithAvailablePets(),
        ]);

        const availableBreederIdSet = new Set(availableBreederIds);

        return breeders.map((breeder) =>
            this.breederExploreCardMapperService.toPopularCard(breeder, this.breederFileUrlPort, availableBreederIdSet),
        );
    }
}
