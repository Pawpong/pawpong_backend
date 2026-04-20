import { Injectable } from '@nestjs/common';

import { AppVersionAdminSnapshot } from '../../application/ports/app-version-admin-reader.port';
import { AppVersionAdminPaginationAssemblerService } from './app-version-admin-pagination-assembler.service';
import { AppVersionAdminItemMapperService } from './app-version-admin-item-mapper.service';
import type { AppVersionAdminPageResult } from '../../application/types/app-version-query.type';

@Injectable()
export class AppVersionAdminPageAssemblerService {
    constructor(
        private readonly appVersionAdminPaginationAssemblerService: AppVersionAdminPaginationAssemblerService,
        private readonly appVersionAdminItemMapperService: AppVersionAdminItemMapperService,
    ) {}

    build(
        items: AppVersionAdminSnapshot[],
        page: number,
        limit: number,
        totalItems: number,
    ): AppVersionAdminPageResult {
        return this.appVersionAdminPaginationAssemblerService.build(
            items.map((item) => this.appVersionAdminItemMapperService.toResult(item)),
            page,
            limit,
            totalItems,
        );
    }
}
