import { Injectable } from '@nestjs/common';

import { AppVersionAdminSnapshot } from '../../application/ports/app-version-admin-reader.port';
import { AppVersionAdminPaginationAssemblerService } from './app-version-admin-pagination-assembler.service';
import { AppVersionAdminItemPresentationService } from './app-version-admin-item-presentation.service';

@Injectable()
export class AppVersionAdminListPresentationService {
    constructor(
        private readonly appVersionAdminPaginationAssemblerService: AppVersionAdminPaginationAssemblerService,
        private readonly appVersionAdminItemPresentationService: AppVersionAdminItemPresentationService,
    ) {}

    toPaginationResponse(
        items: AppVersionAdminSnapshot[],
        page: number,
        limit: number,
        totalItems: number,
    ) {
        return this.appVersionAdminPaginationAssemblerService.build(
            items.map((item) => this.appVersionAdminItemPresentationService.toResponseDto(item)),
            page,
            limit,
            totalItems,
        );
    }
}
