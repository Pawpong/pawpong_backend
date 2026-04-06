import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { NoticeResponseDto } from '../../dto/response/notice-response.dto';
import { NoticeSnapshot } from '../../application/ports/notice-reader.port';

@Injectable()
export class NoticePresentationService {
    buildPage(
        notices: NoticeSnapshot[],
        page: number,
        limit: number,
        totalItems: number,
    ): PaginationResponseDto<NoticeResponseDto> {
        const items = notices.map((notice) => this.toResponseDto(notice));

        return new PaginationBuilder<NoticeResponseDto>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(totalItems)
            .build();
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
