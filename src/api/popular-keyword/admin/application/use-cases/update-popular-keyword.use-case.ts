import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PopularKeywordItemMapperService } from '../../../domain/services/popular-keyword-item-mapper.service';
import type { PopularKeywordItemResult } from '../../../application/types/popular-keyword-result.type';
import {
    POPULAR_KEYWORD_WRITER_PORT,
    type PopularKeywordWriterPort,
} from '../ports/popular-keyword-writer.port';
import type { UpdatePopularKeywordCommand } from '../types/popular-keyword-command.type';

@Injectable()
export class UpdatePopularKeywordUseCase {
    constructor(
        @Inject(POPULAR_KEYWORD_WRITER_PORT)
        private readonly writer: PopularKeywordWriterPort,
        private readonly mapper: PopularKeywordItemMapperService,
    ) {}

    async execute(id: string, command: UpdatePopularKeywordCommand): Promise<PopularKeywordItemResult> {
        const updated = await this.writer.update(id, command);

        if (!updated) {
            throw new BadRequestException('인기 검색어를 찾을 수 없습니다.');
        }

        return this.mapper.toItem(updated);
    }
}
