import { Injectable } from '@nestjs/common';

import { CheckAppVersionUseCase } from './application/use-cases/check-app-version.use-case';
import { AppVersionCheckResponseDto } from './dto/response/app-version-check-response.dto';

/**
 * 앱 버전 체크 서비스 (공개)
 * RN 앱 시작 시 강제/권장 업데이트 여부를 판단
 */
@Injectable()
export class AppVersionService {
    constructor(private readonly checkAppVersionUseCase: CheckAppVersionUseCase) {}

    /**
     * 앱 버전 체크 (RN 앱에서 시작 시 호출)
     * - currentVersion < minRequiredVersion → 강제 업데이트
     * - currentVersion < latestVersion → 권장 업데이트
     * - currentVersion >= latestVersion → 최신 버전
     */
    async checkVersion(platform: 'ios' | 'android', currentVersion: string): Promise<AppVersionCheckResponseDto> {
        return this.checkAppVersionUseCase.execute(platform, currentVersion);
    }
}
