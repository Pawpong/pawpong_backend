import { Inject, Injectable } from '@nestjs/common';

import {
    BREEDER_MANAGEMENT_FILE_URL_PORT,
    type BreederManagementFileUrlPort,
} from '../../../application/ports/breeder-management-file-url.port';
import { CounselBannerResponseDto } from '../../dto/response/counsel-banner-response.dto';
import { ProfileBannerResponseDto } from '../../dto/response/profile-banner-response.dto';
import {
    CounselBannerSnapshot,
    ProfileBannerSnapshot,
} from '../../application/ports/breeder-management-admin-banner-reader.port';

@Injectable()
export class BreederManagementBannerPresentationService {
    constructor(
        @Inject(BREEDER_MANAGEMENT_FILE_URL_PORT)
        private readonly fileUrlPort: BreederManagementFileUrlPort,
    ) {}

    toProfileResponseDto(banner: ProfileBannerSnapshot): ProfileBannerResponseDto {
        return {
            bannerId: banner.bannerId,
            imageUrl: this.fileUrlPort.generateOne(banner.imageFileName, 60 * 24),
            imageFileName: banner.imageFileName,
            bannerType: banner.bannerType,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
        };
    }

    toCounselResponseDto(banner: CounselBannerSnapshot): CounselBannerResponseDto {
        return {
            bannerId: banner.bannerId,
            imageUrl: this.fileUrlPort.generateOne(banner.imageFileName, 60 * 24),
            imageFileName: banner.imageFileName,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
        };
    }
}
