import { Injectable } from '@nestjs/common';

import { NoticeSnapshot } from '../../application/ports/notice-reader.port';
import type { NoticePageResult } from '../../application/types/notice-result.type';
import { NoticePaginationAssemblerService } from './notice-pagination-assembler.service';
import { NoticeItemMapperService } from './notice-item-mapper.service';

@Injectable()
export class NoticePageAssemblerService {
    constructor(
        private readonly noticeItemMapperService: NoticeItemMapperService,
        private readonly noticePaginationAssemblerService: NoticePaginationAssemblerService,
    ) {}

    build(
        notices: NoticeSnapshot[],
        page: number,
        limit: number,
        totalItems: number,
    ): NoticePageResult {
        return this.noticePaginationAssemblerService.build(
            notices.map((notice) => this.noticeItemMapperService.toItem(notice)),
            page,
            limit,
            totalItems,
        );
    }
}
