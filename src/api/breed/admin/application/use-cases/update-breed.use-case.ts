import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';

import { BreedResponseDto } from '../../../dto/response/breed-response.dto';
import { BreedAdminPresentationService } from '../../../domain/services/breed-admin-presentation.service';
import { UpdateBreedRequestDto } from '../../dto/request/update-breed-request.dto';
import { BREED_ADMIN_READER, type BreedAdminReaderPort } from '../ports/breed-admin-reader.port';
import { BREED_WRITER, type BreedWriterPort } from '../ports/breed-writer.port';

@Injectable()
export class UpdateBreedUseCase {
    constructor(
        @Inject(BREED_ADMIN_READER)
        private readonly breedAdminReader: BreedAdminReaderPort,
        @Inject(BREED_WRITER)
        private readonly breedWriter: BreedWriterPort,
        private readonly breedAdminPresentationService: BreedAdminPresentationService,
    ) {}

    async execute(id: string, dto: UpdateBreedRequestDto): Promise<BreedResponseDto> {
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

        return this.breedAdminPresentationService.toResponseDto(updated);
    }
}
