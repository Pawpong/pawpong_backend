import { Inject, Injectable } from '@nestjs/common';

import { HomeFaqCatalogService } from '../../../domain/services/home-faq-catalog.service';
import { HOME_ADMIN_MANAGER, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';
import type { HomeFaqResult } from '../../../application/types/home-content-result.type';

@Injectable()
export class GetAllFaqsUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeFaqCatalogService: HomeFaqCatalogService,
    ) {}

    async execute(): Promise<HomeFaqResult[]> {
        const faqs = await this.homeAdminManager.readAllFaqs();
        return this.homeFaqCatalogService.buildResults(faqs);
    }
}
