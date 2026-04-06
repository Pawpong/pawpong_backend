import { Injectable } from '@nestjs/common';

import { BannerResponseDto } from '../../dto/response/banner-response.dto';
import { HomeBannerSnapshot } from '../../application/ports/home-content-reader.port';

type SignedUrlGenerator = (fileName: string, expirationMinutes?: number) => string;

@Injectable()
export class HomeBannerCatalogService {
    buildResponse(banners: HomeBannerSnapshot[], generateSignedUrl: SignedUrlGenerator): BannerResponseDto[] {
        return banners.map((banner) => {
            const desktopFileName = banner.desktopImageFileName || banner.imageFileName || '';
            const mobileFileName = banner.mobileImageFileName || banner.imageFileName || '';

            return {
                bannerId: banner.id,
                desktopImageUrl: desktopFileName ? generateSignedUrl(desktopFileName, 60 * 24) : '',
                mobileImageUrl: mobileFileName ? generateSignedUrl(mobileFileName, 60 * 24) : '',
                desktopImageFileName: desktopFileName,
                mobileImageFileName: mobileFileName,
                linkType: banner.linkType,
                linkUrl: banner.linkUrl,
                title: banner.title,
                description: banner.description,
                order: banner.order,
                isActive: banner.isActive !== false,
                targetAudience: banner.targetAudience || [],
            };
        });
    }
}
