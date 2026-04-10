import { Inject, Injectable } from '@nestjs/common';

import {
    BREEDER_MANAGEMENT_FILE_URL_PORT,
    type BreederManagementFileUrlPort,
} from '../../../application/ports/breeder-management-file-url.port';
import {
    CounselBannerSnapshot,
    ProfileBannerSnapshot,
} from '../../application/ports/breeder-management-admin-banner-reader.port';
import type {
    BreederManagementCounselBannerResult,
    BreederManagementProfileBannerResult,
} from '../../application/types/breeder-management-admin-banner-result.type';

@Injectable()
export class BreederManagementBannerPresentationService {
    constructor(
        @Inject(BREEDER_MANAGEMENT_FILE_URL_PORT)
        private readonly fileUrlPort: BreederManagementFileUrlPort,
    ) {}

    toProfileResult(banner: ProfileBannerSnapshot): BreederManagementProfileBannerResult {
        return {
            ...this.toBannerBase(banner),
            bannerType: banner.bannerType,
        };
    }

    toCounselResult(banner: CounselBannerSnapshot): BreederManagementCounselBannerResult {
        return this.toBannerBase(banner);
    }

    private toBannerBase(banner: CounselBannerSnapshot | ProfileBannerSnapshot) {
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
