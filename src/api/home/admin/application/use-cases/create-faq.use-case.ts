import { Inject, Injectable } from '@nestjs/common';

import { HomeFaqCatalogService } from '../../../domain/services/home-faq-catalog.service';
import { HOME_ADMIN_MANAGER_PORT, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';
import type { HomeFaqCommand } from '../types/home-admin-command.type';
import type { HomeFaqResult } from '../../../application/types/home-content-result.type';

@Injectable()
export class CreateFaqUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER_PORT)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeFaqCatalogService: HomeFaqCatalogService,
    ) {}

    async execute(data: HomeFaqCommand): Promise<HomeFaqResult> {
        const faq = await this.homeAdminManager.createFaq(data);
        return this.homeFaqCatalogService.buildResults([faq])[0];
    }
}
