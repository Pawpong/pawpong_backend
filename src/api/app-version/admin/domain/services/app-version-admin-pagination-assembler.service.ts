import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { AppVersionResponseDto } from '../../../dto/response/app-version-response.dto';

@Injectable()
export class AppVersionAdminPaginationAssemblerService {
    build(
        items: AppVersionResponseDto[],
        page: number,
        limit: number,
        totalItems: number,
    ): PaginationResponseDto<AppVersionResponseDto> {
        return new PaginationBuilder<AppVersionResponseDto>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(totalItems)
            .build();
    }
}
