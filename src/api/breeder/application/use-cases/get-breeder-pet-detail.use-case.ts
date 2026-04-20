import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import { BreederPublicPetDetailAssemblerService } from '../../domain/services/breeder-public-pet-detail-assembler.service';

@Injectable()
export class GetBreederPetDetailUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        private readonly breederPublicPetDetailAssemblerService: BreederPublicPetDetailAssemblerService,
    ) {}

    async execute(breederId: string, petId: string) {
        const breeder = await this.breederPublicReaderPort.findPublicBreederById(breederId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더를 찾을 수 없습니다.');
        }

        const pets = await this.breederPublicReaderPort.findActiveAvailablePetsByBreederId(breederId);
        const pet = pets.find((item) => String(item._id) === petId);
        if (!pet) {
            throw new DomainNotFoundError('반려동물을 찾을 수 없습니다.');
        }

        return this.breederPublicPetDetailAssemblerService.toResponse(pet);
    }
}
