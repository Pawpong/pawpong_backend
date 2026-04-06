import { Inject, Injectable } from '@nestjs/common';

import { CounselBannerCreateRequestDto } from '../../dto/request/counsel-banner-create-request.dto';
import { CounselBannerResponseDto } from '../../dto/response/counsel-banner-response.dto';
import { BreederManagementBannerPresentationService } from '../../domain/services/breeder-management-banner-presentation.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER,
    type BreederManagementAdminBannerWriterPort,
} from '../ports/breeder-management-admin-banner-writer.port';

@Injectable()
export class CreateCounselBannerUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER)
        private readonly bannerWriter: BreederManagementAdminBannerWriterPort,
        private readonly breederManagementBannerPresentationService: BreederManagementBannerPresentationService,
    ) {}

    async execute(data: CounselBannerCreateRequestDto): Promise<CounselBannerResponseDto> {
        const banner = await this.bannerWriter.createCounsel(data);
        return this.breederManagementBannerPresentationService.toCounselResponseDto(banner);
    }
}
