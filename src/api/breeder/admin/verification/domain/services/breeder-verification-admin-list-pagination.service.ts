import { Injectable } from '@nestjs/common';

import { BreederPaginationAssemblerService } from '../../../../domain/services/breeder-pagination-assembler.service';

@Injectable()
export class BreederVerificationAdminListPaginationService {
    constructor(private readonly breederPaginationAssemblerService: BreederPaginationAssemblerService) {}

    toPaginatedResponse<T>(items: T[], page: number, limit: number, total: number) {
        return this.breederPaginationAssemblerService.build(items, page, limit, total);
    }
}
