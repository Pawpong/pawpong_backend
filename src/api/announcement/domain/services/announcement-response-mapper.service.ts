import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { AnnouncementResponseDto } from '../../dto/response/announcement-response.dto';
import {
    type AnnouncementPublicItem,
    type AnnouncementPublicListResult,
} from '../../application/ports/announcement-public-reader.port';

@Injectable()
export class AnnouncementResponseMapperService {
    toPaginationResponse(result: AnnouncementPublicListResult): PaginationResponseDto<AnnouncementResponseDto> {
        return new PaginationBuilder<AnnouncementResponseDto>()
            .setItems(result.items.map((item) => this.toResponse(item)))
            .setTotalCount(result.totalCount)
            .setPage(result.page)
            .setLimit(result.limit)
            .build();
    }

    toResponse(item: AnnouncementPublicItem): AnnouncementResponseDto {
        return {
            announcementId: item.announcementId,
            title: item.title,
            content: item.content,
            isActive: item.isActive,
            order: item.order,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
}
