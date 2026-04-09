import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { AnnouncementResponseDto } from '../../dto/response/announcement-response.dto';

@Injectable()
export class AnnouncementPaginationAssemblerService {
    build(
        items: AnnouncementResponseDto[],
        page: number,
        limit: number,
        totalCount: number,
    ): PaginationResponseDto<AnnouncementResponseDto> {
        return new PaginationBuilder<AnnouncementResponseDto>()
            .setItems(items)
            .setTotalCount(totalCount)
            .setPage(page)
            .setLimit(limit)
            .build();
    }
}
