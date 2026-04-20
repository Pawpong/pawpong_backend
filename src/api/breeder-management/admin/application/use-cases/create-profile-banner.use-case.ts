import { Inject, Injectable } from '@nestjs/common';

import { BreederManagementBannerResultMapperService } from '../../domain/services/breeder-management-banner-result-mapper.service';
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
        private readonly breederManagementBannerResultMapperService: BreederManagementBannerResultMapperService,
    ) {}

    async execute(data: BreederManagementProfileBannerCreateCommand): Promise<BreederManagementProfileBannerResult> {
        const banner = await this.bannerWriter.createProfile(data);
        return this.breederManagementBannerResultMapperService.toProfileResult(banner);
    }
}
