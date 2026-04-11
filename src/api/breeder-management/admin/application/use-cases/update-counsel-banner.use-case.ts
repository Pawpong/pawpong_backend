import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BreederManagementBannerResultMapperService } from '../../domain/services/breeder-management-banner-result-mapper.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT,
    type BreederManagementAdminBannerWriterPort,
} from '../ports/breeder-management-admin-banner-writer.port';
import type { BreederManagementCounselBannerUpdateCommand } from '../types/breeder-management-admin-banner-command.type';
import type { BreederManagementCounselBannerResult } from '../types/breeder-management-admin-banner-result.type';

@Injectable()
export class UpdateCounselBannerUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT)
        private readonly bannerWriter: BreederManagementAdminBannerWriterPort,
        private readonly breederManagementBannerResultMapperService: BreederManagementBannerResultMapperService,
    ) {}

    async execute(
        bannerId: string,
        data: BreederManagementCounselBannerUpdateCommand,
    ): Promise<BreederManagementCounselBannerResult> {
        const banner = await this.bannerWriter.updateCounsel(bannerId, data);

        if (!banner) {
            throw new BadRequestException('상담 배너를 찾을 수 없습니다.');
        }

        return this.breederManagementBannerResultMapperService.toCounselResult(banner);
    }
}
