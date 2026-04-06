import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BreedResponseDto } from '../../../dto/response/breed-response.dto';
import { BreedAdminPresentationService } from '../../../domain/services/breed-admin-presentation.service';
import { BREED_ADMIN_READER, type BreedAdminReaderPort } from '../ports/breed-admin-reader.port';

@Injectable()
export class GetBreedByIdUseCase {
    constructor(
        @Inject(BREED_ADMIN_READER)
        private readonly breedAdminReader: BreedAdminReaderPort,
        private readonly breedAdminPresentationService: BreedAdminPresentationService,
    ) {}

    async execute(id: string): Promise<BreedResponseDto> {
        const breed = await this.breedAdminReader.findById(id);

        if (!breed) {
            throw new BadRequestException(`ID ${id}에 해당하는 품종 카테고리를 찾을 수 없습니다.`);
        }

        return this.breedAdminPresentationService.toResponseDto(breed);
    }
}
