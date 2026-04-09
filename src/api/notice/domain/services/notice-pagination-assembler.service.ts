import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { NoticeResponseDto } from '../../dto/response/notice-response.dto';

@Injectable()
export class NoticePaginationAssemblerService {
    build(
        items: NoticeResponseDto[],
        page: number,
        limit: number,
        totalItems: number,
    ): PaginationResponseDto<NoticeResponseDto> {
        return new PaginationBuilder<NoticeResponseDto>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(totalItems)
            .build();
    }
}
