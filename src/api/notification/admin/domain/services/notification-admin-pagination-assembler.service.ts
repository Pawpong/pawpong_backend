import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { NotificationAdminResponseDto } from '../../dto/response/notification-admin-response.dto';

@Injectable()
export class NotificationAdminPaginationAssemblerService {
    build(
        items: NotificationAdminResponseDto[],
        page: number,
        limit: number,
        totalItems: number,
    ): PaginationResponseDto<NotificationAdminResponseDto> {
        return new PaginationBuilder<NotificationAdminResponseDto>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(totalItems)
            .build();
    }
}
