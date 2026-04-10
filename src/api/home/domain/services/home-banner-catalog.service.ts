import { Injectable } from '@nestjs/common';

import { HomeBannerSnapshot } from '../../application/ports/home-content-reader.port';
import type { HomeBannerResult } from '../../application/types/home-content-result.type';

type SignedUrlGenerator = (fileName: string, expirationMinutes?: number) => string;

@Injectable()
export class HomeBannerCatalogService {
    buildResults(banners: HomeBannerSnapshot[], generateSignedUrl: SignedUrlGenerator): HomeBannerResult[] {
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
