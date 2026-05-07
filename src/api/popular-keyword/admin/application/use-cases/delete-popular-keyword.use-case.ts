import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import {
    POPULAR_KEYWORD_WRITER_PORT,
    type PopularKeywordWriterPort,
} from '../ports/popular-keyword-writer.port';

@Injectable()
export class DeletePopularKeywordUseCase {
    constructor(
        @Inject(POPULAR_KEYWORD_WRITER_PORT)
        private readonly writer: PopularKeywordWriterPort,
    ) {}

    async execute(id: string): Promise<void> {
        const deleted = await this.writer.delete(id);

        if (!deleted) {
            throw new BadRequestException('인기 검색어를 찾을 수 없습니다.');
        }
    }
}
