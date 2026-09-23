import { Injectable } from '@nestjs/common';
import { StorageService } from '../../../../common/storage/storage.service';
import type { AppSplashAssetsPort } from '../application/ports/app-splash-assets.port';

@Injectable()
export class AppSplashAssetsAdapter implements AppSplashAssetsPort {
    constructor(private readonly storage: StorageService) {}
    /** 빈 키는 앱에 포함된 SVG 기반 기본 로고로 표시한다. */
    imageUrl(fileName: string): string {
        return fileName ? this.storage.getCdnUrl(fileName) : '';
    }
}
