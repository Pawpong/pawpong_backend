import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { NotificationResponseDto } from '../../dto/response/notification-response.dto';

@Injectable()
export class NotificationPaginationAssemblerService {
    build(
        items: NotificationResponseDto[],
        page: number,
        limit: number,
        totalItems: number,
    ): PaginationResponseDto<NotificationResponseDto> {
        return new PaginationBuilder<NotificationResponseDto>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(totalItems)
            .build();
    }
}
