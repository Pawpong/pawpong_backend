import { Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { NoticeResponseDto } from '../../dto/response/notice-response.dto';
import { NoticeSnapshot } from '../../application/ports/notice-reader.port';
import { NoticePaginationAssemblerService } from './notice-pagination-assembler.service';

@Injectable()
export class NoticePresentationService {
    constructor(private readonly noticePaginationAssemblerService: NoticePaginationAssemblerService) {}

    buildPage(
        notices: NoticeSnapshot[],
        page: number,
        limit: number,
        totalItems: number,
    ): PaginationResponseDto<NoticeResponseDto> {
        const items = notices.map((notice) => this.toResponseDto(notice));

        return this.noticePaginationAssemblerService.build(items, page, limit, totalItems);
    }

    toResponseDto(notice: NoticeSnapshot): NoticeResponseDto {
        return {
            noticeId: notice.id,
            title: notice.title,
            content: notice.content,
            authorName: notice.authorName,
            status: notice.status,
            isPinned: notice.isPinned,
            viewCount: notice.viewCount || 0,
            publishedAt: notice.publishedAt?.toISOString(),
            expiredAt: notice.expiredAt?.toISOString(),
            createdAt: notice.createdAt.toISOString(),
            updatedAt: notice.updatedAt.toISOString(),
        };
    }
}
