import { Injectable } from '@nestjs/common';

import type { BreederPublicReaderPort } from '../../application/ports/breeder-public-reader.port';

@Injectable()
export class BreederExploreFavoriteReaderService {
    async readFavoriteBreederIds(
        userId: string | undefined,
        breederPublicReaderPort: BreederPublicReaderPort,
    ): Promise<string[]> {
        if (!userId) {
            return [];
        }

        const adopterFavorites = await breederPublicReaderPort.findAdopterFavoriteBreederIds(userId);
        if (adopterFavorites) {
            return adopterFavorites;
        }

        return (await breederPublicReaderPort.findBreederFavoriteBreederIds(userId)) || [];
    }
}
