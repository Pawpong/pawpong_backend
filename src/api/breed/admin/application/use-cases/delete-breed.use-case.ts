import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREED_WRITER, type BreedWriterPort } from '../ports/breed-writer.port';

@Injectable()
export class DeleteBreedUseCase {
    constructor(
        @Inject(BREED_WRITER)
        private readonly breedWriter: BreedWriterPort,
    ) {}

    async execute(id: string): Promise<void> {
        const deleted = await this.breedWriter.delete(id);

        if (!deleted) {
            throw new BadRequestException(`ID ${id}에 해당하는 품종 카테고리를 찾을 수 없습니다.`);
        }
    }
}
