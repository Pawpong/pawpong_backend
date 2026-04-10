import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_FILE_URL_PORT } from '../ports/breeder-file-url.port';
import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import type { BreederFileUrlPort } from '../ports/breeder-file-url.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import { BreederPublicProfileAssemblerService } from '../../domain/services/breeder-public-profile-assembler.service';
import type { BreederProfileResult } from '../types/breeder-result.type';

@Injectable()
export class GetBreederProfileUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        @Inject(BREEDER_FILE_URL_PORT)
        private readonly breederFileUrlPort: BreederFileUrlPort,
        private readonly breederPublicProfileAssemblerService: BreederPublicProfileAssemblerService,
    ) {}

    async execute(breederId: string, userId?: string): Promise<BreederProfileResult> {
        const breeder = await this.breederPublicReaderPort.findPublicBreederById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        if (breeder.accountStatus === 'deleted') {
            throw new BadRequestException('탈퇴한 브리더의 프로필은 조회할 수 없습니다.');
        }

        let isFavorited = false;
        if (userId) {
            const adopterFavorites = await this.breederPublicReaderPort.findAdopterFavoriteBreederIds(userId);

            if (adopterFavorites) {
                isFavorited = adopterFavorites.includes(breederId);
            } else {
                const breederFavorites = await this.breederPublicReaderPort.findBreederFavoriteBreederIds(userId);
                isFavorited = (breederFavorites || []).includes(breederId);
            }

            await this.breederPublicReaderPort.incrementProfileViews(breederId);
        }

        const [availablePets, parentPets] = await Promise.all([
            this.breederPublicReaderPort.findActiveAvailablePetsByBreederId(breederId),
            this.breederPublicReaderPort.findActiveParentPetsByBreederId(breederId),
        ]);

        return this.breederPublicProfileAssemblerService.toResponse(
            breeder,
            isFavorited,
            availablePets,
            parentPets,
            this.breederFileUrlPort,
        );
    }
}
