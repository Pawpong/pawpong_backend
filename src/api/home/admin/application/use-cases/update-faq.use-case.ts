import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { FaqResponseDto } from '../../../dto/response/faq-response.dto';
import { HomeFaqCatalogService } from '../../../domain/services/home-faq-catalog.service';
import { HOME_ADMIN_MANAGER, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';
import type { HomeFaqUpdateCommand } from '../types/home-admin-command.type';

@Injectable()
export class UpdateFaqUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeFaqCatalogService: HomeFaqCatalogService,
    ) {}

    async execute(faqId: string, data: HomeFaqUpdateCommand): Promise<FaqResponseDto> {
        const faq = await this.homeAdminManager.updateFaq(faqId, data);

        if (!faq) {
            throw new BadRequestException('FAQ를 찾을 수 없습니다.');
        }

        return this.homeFaqCatalogService.buildResponse([faq])[0];
    }
}
