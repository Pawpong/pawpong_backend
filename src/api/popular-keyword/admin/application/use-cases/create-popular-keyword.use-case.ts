import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { PopularKeywordItemMapperService } from '../../../domain/services/popular-keyword-item-mapper.service';
import type { PopularKeywordItemResult } from '../../../application/types/popular-keyword-result.type';
import {
    POPULAR_KEYWORD_ADMIN_READER_PORT,
    type PopularKeywordAdminReaderPort,
} from '../ports/popular-keyword-admin-reader.port';
import { POPULAR_KEYWORD_WRITER_PORT, type PopularKeywordWriterPort } from '../ports/popular-keyword-writer.port';
import type { CreatePopularKeywordCommand } from '../types/popular-keyword-command.type';

@Injectable()
export class CreatePopularKeywordUseCase {
    constructor(
        @Inject(POPULAR_KEYWORD_ADMIN_READER_PORT)
        private readonly reader: PopularKeywordAdminReaderPort,
        @Inject(POPULAR_KEYWORD_WRITER_PORT)
        private readonly writer: PopularKeywordWriterPort,
        private readonly mapper: PopularKeywordItemMapperService,
    ) {}

    async execute(command: CreatePopularKeywordCommand): Promise<PopularKeywordItemResult> {
        const existing = await this.reader.findByKeyword(command.keyword);

        if (existing) {
            throw new ConflictException(`이미 등록된 키워드입니다: ${command.keyword}`);
        }

        const created = await this.writer.create(command);
        return this.mapper.toItem(created);
    }
}
