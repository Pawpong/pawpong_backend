import { Inject, Injectable } from '@nestjs/common';

import { FaqResponseDto } from '../../../dto/response/faq-response.dto';
import { HomeFaqCatalogService } from '../../../domain/services/home-faq-catalog.service';
import { HOME_ADMIN_MANAGER, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';
import type { HomeFaqCommand } from '../types/home-admin-command.type';

@Injectable()
export class CreateFaqUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeFaqCatalogService: HomeFaqCatalogService,
    ) {}

    async execute(data: HomeFaqCommand): Promise<FaqResponseDto> {
        const faq = await this.homeAdminManager.createFaq(data);
        return this.homeFaqCatalogService.buildResponse([faq])[0];
    }
}
