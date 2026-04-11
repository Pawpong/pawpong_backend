import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';

import { BreedAdminResultMapperService } from '../../../domain/services/breed-admin-result-mapper.service';
import { BREED_ADMIN_READER_PORT, type BreedAdminReaderPort } from '../ports/breed-admin-reader.port';
import { BREED_WRITER_PORT, type BreedWriterPort } from '../ports/breed-writer.port';
import { type UpdateBreedCommand } from '../types/breed-command.type';
import { type BreedAdminItemResult } from '../types/breed-result.type';

@Injectable()
export class UpdateBreedUseCase {
    constructor(
        @Inject(BREED_ADMIN_READER_PORT)
        private readonly breedAdminReader: BreedAdminReaderPort,
        @Inject(BREED_WRITER_PORT)
        private readonly breedWriter: BreedWriterPort,
        private readonly breedAdminResultMapperService: BreedAdminResultMapperService,
    ) {}

    async execute(id: string, dto: UpdateBreedCommand): Promise<BreedAdminItemResult> {
        const breed = await this.breedAdminReader.findById(id);

        if (!breed) {
            throw new BadRequestException(`ID ${id}에 해당하는 품종 카테고리를 찾을 수 없습니다.`);
        }

        if (dto.category && dto.category !== breed.category) {
            const existing = await this.breedAdminReader.findByPetTypeAndCategory(breed.petType, dto.category, id);

            if (existing) {
                throw new ConflictException(`이미 ${breed.petType}의 ${dto.category} 카테고리가 존재합니다.`);
            }
        }

        const updated = await this.breedWriter.update(id, dto);

        if (!updated) {
            throw new BadRequestException(`ID ${id}에 해당하는 품종 카테고리를 찾을 수 없습니다.`);
        }

        return this.breedAdminResultMapperService.toResult(updated);
    }
}
