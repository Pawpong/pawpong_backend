import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import { BREEDER_FILE_URL_PORT } from '../ports/breeder-file-url.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import type { BreederFileUrlPort } from '../ports/breeder-file-url.port';
import { BreederPublicPetPageAssemblerService } from '../../domain/services/breeder-public-pet-page-assembler.service';

@Injectable()
export class GetBreederPetsUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        @Inject(BREEDER_FILE_URL_PORT)
        private readonly breederFileUrlPort: BreederFileUrlPort,
        private readonly breederPublicPetPageAssemblerService: BreederPublicPetPageAssemblerService,
    ) {}

    async execute(breederId: string, status?: string, page: number = 1, limit: number = 20) {
        const breeder = await this.breederPublicReaderPort.findPublicBreederById(breederId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더를 찾을 수 없습니다.');
        }

        const pets = await this.breederPublicReaderPort.findActiveAvailablePetsByBreederId(breederId);
        return this.breederPublicPetPageAssemblerService.build(pets, status, page, limit, this.breederFileUrlPort);
    }
}
