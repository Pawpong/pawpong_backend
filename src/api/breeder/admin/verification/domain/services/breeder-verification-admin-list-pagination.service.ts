import { Injectable } from '@nestjs/common';

import type { PageResult } from '../../../../../../common/types/page-result.type';
import { BreederPaginationAssemblerService } from '../../../../domain/services/breeder-pagination-assembler.service';

@Injectable()
export class BreederVerificationAdminListPaginationService {
    constructor(private readonly breederPaginationAssemblerService: BreederPaginationAssemblerService) {}

    toPaginatedResponse<T>(items: T[], page: number, limit: number, total: number): PageResult<T> {
        return this.breederPaginationAssemblerService.build(items, page, limit, total);
    }
}
