import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CounselBannerUpdateRequestDto } from '../../dto/request/counsel-banner-update-request.dto';
import { CounselBannerResponseDto } from '../../dto/response/counsel-banner-response.dto';
import { BreederManagementBannerPresentationService } from '../../domain/services/breeder-management-banner-presentation.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER,
    type BreederManagementAdminBannerWriterPort,
} from '../ports/breeder-management-admin-banner-writer.port';

@Injectable()
export class UpdateCounselBannerUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER)
        private readonly bannerWriter: BreederManagementAdminBannerWriterPort,
        private readonly breederManagementBannerPresentationService: BreederManagementBannerPresentationService,
    ) {}

    async execute(bannerId: string, data: CounselBannerUpdateRequestDto): Promise<CounselBannerResponseDto> {
        const banner = await this.bannerWriter.updateCounsel(bannerId, data);

        if (!banner) {
            throw new BadRequestException('상담 배너를 찾을 수 없습니다.');
        }

        return this.breederManagementBannerPresentationService.toCounselResponseDto(banner);
    }
}
