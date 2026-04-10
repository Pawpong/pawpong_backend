import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

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
        if (!Types.ObjectId.isValid(breederId)) {
            throw new BadRequestException('올바르지 않은 브리더 ID 형식입니다.');
        }

        const breeder = await this.breederPublicReaderPort.findPublicBreederById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        const pets = await this.breederPublicReaderPort.findActiveAvailablePetsByBreederId(breederId);
        const pet = pets.find((item) => String(item._id) === petId);
        if (!pet) {
            throw new BadRequestException('반려동물을 찾을 수 없습니다.');
        }

        return this.breederPublicPetDetailAssemblerService.toResponse(pet);
    }
}
