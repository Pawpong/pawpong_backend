import { Inject, Injectable } from '@nestjs/common';

import { DomainConflictError } from '../../../../../common/error/domain.error';
import { BreedAdminResultMapperService } from '../../../domain/services/breed-admin-result-mapper.service';
import { BREED_ADMIN_READER_PORT, type BreedAdminReaderPort } from '../ports/breed-admin-reader.port';
import { BREED_WRITER_PORT, type BreedWriterPort } from '../ports/breed-writer.port';
import { type CreateBreedCommand } from '../types/breed-command.type';
import { type BreedAdminItemResult } from '../types/breed-result.type';

@Injectable()
export class CreateBreedUseCase {
    constructor(
        @Inject(BREED_ADMIN_READER_PORT)
        private readonly breedAdminReader: BreedAdminReaderPort,
        @Inject(BREED_WRITER_PORT)
        private readonly breedWriter: BreedWriterPort,
        private readonly breedAdminResultMapperService: BreedAdminResultMapperService,
    ) {}

    async execute(dto: CreateBreedCommand): Promise<BreedAdminItemResult> {
        const existing = await this.breedAdminReader.findByPetTypeAndCategory(dto.petType, dto.category);

        if (existing) {
            throw new DomainConflictError(`이미 ${dto.petType}의 ${dto.category} 카테고리가 존재합니다.`);
        }

        const breed = await this.breedWriter.create(dto);
        return this.breedAdminResultMapperService.toResult(breed);
    }
}
