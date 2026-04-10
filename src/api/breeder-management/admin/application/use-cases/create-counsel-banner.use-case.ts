import { Inject, Injectable } from '@nestjs/common';

import { CounselBannerResponseDto } from '../../dto/response/counsel-banner-response.dto';
import { BreederManagementBannerPresentationService } from '../../domain/services/breeder-management-banner-presentation.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER,
    type BreederManagementAdminBannerWriterPort,
} from '../ports/breeder-management-admin-banner-writer.port';
import type { BreederManagementCounselBannerCreateCommand } from '../types/breeder-management-admin-banner-command.type';

@Injectable()
export class CreateCounselBannerUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER)
        private readonly bannerWriter: BreederManagementAdminBannerWriterPort,
        private readonly breederManagementBannerPresentationService: BreederManagementBannerPresentationService,
    ) {}

    async execute(data: BreederManagementCounselBannerCreateCommand): Promise<CounselBannerResponseDto> {
        const banner = await this.bannerWriter.createCounsel(data);
        return this.breederManagementBannerPresentationService.toCounselResponseDto(banner);
    }
}
