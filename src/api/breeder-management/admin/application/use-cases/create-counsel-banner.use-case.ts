import { Inject, Injectable } from '@nestjs/common';

import { BreederManagementBannerPresentationService } from '../../domain/services/breeder-management-banner-presentation.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT,
    type BreederManagementAdminBannerWriterPort,
} from '../ports/breeder-management-admin-banner-writer.port';
import type { BreederManagementCounselBannerCreateCommand } from '../types/breeder-management-admin-banner-command.type';
import type { BreederManagementCounselBannerResult } from '../types/breeder-management-admin-banner-result.type';

@Injectable()
export class CreateCounselBannerUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT)
        private readonly bannerWriter: BreederManagementAdminBannerWriterPort,
        private readonly breederManagementBannerPresentationService: BreederManagementBannerPresentationService,
    ) {}

    async execute(data: BreederManagementCounselBannerCreateCommand): Promise<BreederManagementCounselBannerResult> {
        const banner = await this.bannerWriter.createCounsel(data);
        return this.breederManagementBannerPresentationService.toCounselResult(banner);
    }
}
