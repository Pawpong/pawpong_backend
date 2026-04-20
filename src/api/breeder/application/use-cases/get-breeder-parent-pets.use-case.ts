import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import { BREEDER_FILE_URL_PORT } from '../ports/breeder-file-url.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import type { BreederFileUrlPort } from '../ports/breeder-file-url.port';
import { BreederPublicParentPetListAssemblerService } from '../../domain/services/breeder-public-parent-pet-list-assembler.service';

@Injectable()
export class GetBreederParentPetsUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        @Inject(BREEDER_FILE_URL_PORT)
        private readonly breederFileUrlPort: BreederFileUrlPort,
        private readonly breederPublicParentPetListAssemblerService: BreederPublicParentPetListAssemblerService,
    ) {}

    async execute(breederId: string, page?: number, limit?: number) {
        const breeder = await this.breederPublicReaderPort.findPublicBreederById(breederId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더를 찾을 수 없습니다.');
        }

        const parentPets = await this.breederPublicReaderPort.findActiveParentPetsByBreederId(breederId);
        return this.breederPublicParentPetListAssemblerService.build(
            parentPets,
            page,
            limit,
            this.breederFileUrlPort,
        );
    }
}
