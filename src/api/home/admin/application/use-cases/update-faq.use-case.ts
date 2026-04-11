import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { HomeFaqCatalogService } from '../../../domain/services/home-faq-catalog.service';
import { HOME_ADMIN_MANAGER_PORT, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';
import type { HomeFaqUpdateCommand } from '../types/home-admin-command.type';
import type { HomeFaqResult } from '../../../application/types/home-content-result.type';

@Injectable()
export class UpdateFaqUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER_PORT)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeFaqCatalogService: HomeFaqCatalogService,
    ) {}

    async execute(faqId: string, data: HomeFaqUpdateCommand): Promise<HomeFaqResult> {
        const faq = await this.homeAdminManager.updateFaq(faqId, data);

        if (!faq) {
            throw new BadRequestException('FAQ를 찾을 수 없습니다.');
        }

        return this.homeFaqCatalogService.buildResults([faq])[0];
    }
}
