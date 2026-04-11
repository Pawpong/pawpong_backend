import { Inject, Injectable } from '@nestjs/common';

import { BreederManagementBannerPresentationService } from '../../domain/services/breeder-management-banner-presentation.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT,
    type BreederManagementAdminBannerWriterPort,
} from '../ports/breeder-management-admin-banner-writer.port';
import type { BreederManagementProfileBannerCreateCommand } from '../types/breeder-management-admin-banner-command.type';
import type { BreederManagementProfileBannerResult } from '../types/breeder-management-admin-banner-result.type';

@Injectable()
export class CreateProfileBannerUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT)
        private readonly bannerWriter: BreederManagementAdminBannerWriterPort,
        private readonly breederManagementBannerPresentationService: BreederManagementBannerPresentationService,
    ) {}

    async execute(data: BreederManagementProfileBannerCreateCommand): Promise<BreederManagementProfileBannerResult> {
        const banner = await this.bannerWriter.createProfile(data);
        return this.breederManagementBannerPresentationService.toProfileResult(banner);
    }
}
