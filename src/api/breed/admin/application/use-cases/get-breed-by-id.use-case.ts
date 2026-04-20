import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { BreedAdminResultMapperService } from '../../../domain/services/breed-admin-result-mapper.service';
import { BREED_ADMIN_READER_PORT, type BreedAdminReaderPort } from '../ports/breed-admin-reader.port';
import { type BreedAdminItemResult } from '../types/breed-result.type';

@Injectable()
export class GetBreedByIdUseCase {
    constructor(
        @Inject(BREED_ADMIN_READER_PORT)
        private readonly breedAdminReader: BreedAdminReaderPort,
        private readonly breedAdminResultMapperService: BreedAdminResultMapperService,
    ) {}

    async execute(id: string): Promise<BreedAdminItemResult> {
        const breed = await this.breedAdminReader.findById(id);

        if (!breed) {
            throw new DomainNotFoundError(`ID ${id}에 해당하는 품종 카테고리를 찾을 수 없습니다.`);
        }

        return this.breedAdminResultMapperService.toResult(breed);
    }
}
