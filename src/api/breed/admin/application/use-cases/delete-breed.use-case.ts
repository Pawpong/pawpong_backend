import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { BREED_WRITER_PORT, type BreedWriterPort } from '../ports/breed-writer.port';

@Injectable()
export class DeleteBreedUseCase {
    constructor(
        @Inject(BREED_WRITER_PORT)
        private readonly breedWriter: BreedWriterPort,
    ) {}

    async execute(id: string): Promise<void> {
        const deleted = await this.breedWriter.delete(id);

        if (!deleted) {
            throw new DomainNotFoundError(`ID ${id}에 해당하는 품종 카테고리를 찾을 수 없습니다.`);
        }
    }
}
