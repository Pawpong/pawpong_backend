import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';

import { PopularKeywordItemMapperService } from '../../../domain/services/popular-keyword-item-mapper.service';
import type { PopularKeywordItemResult } from '../../../application/types/popular-keyword-result.type';
import {
    POPULAR_KEYWORD_ADMIN_READER_PORT,
    type PopularKeywordAdminReaderPort,
} from '../ports/popular-keyword-admin-reader.port';
import { POPULAR_KEYWORD_WRITER_PORT, type PopularKeywordWriterPort } from '../ports/popular-keyword-writer.port';
import type { UpdatePopularKeywordCommand } from '../types/popular-keyword-command.type';

@Injectable()
export class UpdatePopularKeywordUseCase {
    constructor(
        @Inject(POPULAR_KEYWORD_ADMIN_READER_PORT)
        private readonly reader: PopularKeywordAdminReaderPort,
        @Inject(POPULAR_KEYWORD_WRITER_PORT)
        private readonly writer: PopularKeywordWriterPort,
        private readonly mapper: PopularKeywordItemMapperService,
    ) {}

    async execute(id: string, command: UpdatePopularKeywordCommand): Promise<PopularKeywordItemResult> {
        const existing = await this.reader.readById(id);

        if (!existing) {
            throw new BadRequestException('인기 검색어를 찾을 수 없습니다.');
        }

        // keyword 변경 요청 시 다른 도큐먼트와의 중복을 사전 검증 (Mongo E11000 → 500 방지)
        if (command.keyword !== undefined && command.keyword !== existing.keyword) {
            const conflict = await this.reader.findByKeyword(command.keyword);
            if (conflict && conflict.id !== id) {
                throw new ConflictException(`이미 등록된 키워드입니다: ${command.keyword}`);
            }
        }

        const updated = await this.writer.update(id, command);

        if (!updated) {
            throw new BadRequestException('인기 검색어를 찾을 수 없습니다.');
        }

        return this.mapper.toItem(updated);
    }
}
