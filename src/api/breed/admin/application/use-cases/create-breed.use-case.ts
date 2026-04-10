import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { BreedResponseDto } from '../../../dto/response/breed-response.dto';
import { BreedAdminPresentationService } from '../../../domain/services/breed-admin-presentation.service';
import { BREED_ADMIN_READER, type BreedAdminReaderPort } from '../ports/breed-admin-reader.port';
import { BREED_WRITER, type BreedWriterPort } from '../ports/breed-writer.port';
import { type CreateBreedCommand } from '../types/breed-command.type';

@Injectable()
export class CreateBreedUseCase {
    constructor(
        @Inject(BREED_ADMIN_READER)
        private readonly breedAdminReader: BreedAdminReaderPort,
        @Inject(BREED_WRITER)
        private readonly breedWriter: BreedWriterPort,
        private readonly breedAdminPresentationService: BreedAdminPresentationService,
    ) {}

    async execute(dto: CreateBreedCommand): Promise<BreedResponseDto> {
        const existing = await this.breedAdminReader.findByPetTypeAndCategory(dto.petType, dto.category);

        if (existing) {
            throw new ConflictException(`이미 ${dto.petType}의 ${dto.category} 카테고리가 존재합니다.`);
        }

        const breed = await this.breedWriter.create(dto);
        return this.breedAdminPresentationService.toResponseDto(breed);
    }
}
