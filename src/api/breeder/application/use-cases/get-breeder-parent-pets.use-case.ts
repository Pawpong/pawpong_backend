import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import { BREEDER_FILE_URL_PORT } from '../ports/breeder-file-url.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import type { BreederFileUrlPort } from '../ports/breeder-file-url.port';
import { BreederPublicParentPetListResponseMapperService } from '../../domain/services/breeder-public-parent-pet-list-response-mapper.service';

@Injectable()
export class GetBreederParentPetsUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        @Inject(BREEDER_FILE_URL_PORT)
        private readonly breederFileUrlPort: BreederFileUrlPort,
        private readonly breederPublicParentPetListResponseMapperService: BreederPublicParentPetListResponseMapperService,
    ) {}

    async execute(breederId: string, page?: number, limit?: number) {
        if (!Types.ObjectId.isValid(breederId)) {
            throw new BadRequestException('올바르지 않은 브리더 ID 형식입니다.');
        }

        const breeder = await this.breederPublicReaderPort.findPublicBreederById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        const parentPets = await this.breederPublicReaderPort.findActiveParentPetsByBreederId(breederId);
        return this.breederPublicParentPetListResponseMapperService.toResponse(
            parentPets,
            page,
            limit,
            this.breederFileUrlPort,
        );
    }
}
