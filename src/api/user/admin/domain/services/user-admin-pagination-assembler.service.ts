import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';

@Injectable()
export class UserAdminPaginationAssemblerService {
    build<T>(items: T[], page: number, limit: number, totalCount: number): PaginationResponseDto<T> {
        return new PaginationBuilder<T>().setItems(items).setPage(page).setLimit(limit).setTotalCount(totalCount).build();
    }
}
