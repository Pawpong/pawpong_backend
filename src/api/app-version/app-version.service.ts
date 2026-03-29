import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { AppVersion } from '../../schema/app-version.schema';

import { AppVersionCheckResponseDto } from './dto/response/app-version-check-response.dto';

/**
 * 앱 버전 체크 서비스 (공개)
 * RN 앱 시작 시 강제/권장 업데이트 여부를 판단
 */
@Injectable()
export class AppVersionService {
    constructor(
        @InjectModel(AppVersion.name) private appVersionModel: Model<AppVersion>,
        private readonly logger: CustomLoggerService,
    ) {}

    /**
     * 앱 버전 체크 (RN 앱에서 시작 시 호출)
     * - currentVersion < minRequiredVersion → 강제 업데이트
     * - currentVersion < latestVersion → 권장 업데이트
     * - currentVersion >= latestVersion → 최신 버전
     */
    async checkVersion(platform: 'ios' | 'android', currentVersion: string): Promise<AppVersionCheckResponseDto> {
        this.logger.logStart('checkVersion', '앱 버전 체크', { platform, currentVersion });

        if (!platform || !currentVersion) {
            throw new BadRequestException('플랫폼과 현재 버전 정보가 필요합니다.');
        }

        try {
            // 해당 플랫폼의 가장 최근 활성 버전 정보 조회
            const versionInfo = await this.appVersionModel
                .findOne({ platform, isActive: true })
                .sort({ createdAt: -1 })
                .lean()
                .exec();

            // 버전 정보 없으면 업데이트 불필요로 응답 (앱 접근 막지 않음)
            if (!versionInfo) {
                this.logger.logSuccess('checkVersion', '앱 버전 정보 없음 - 업데이트 불필요', { platform });
                return {
                    needsForceUpdate: false,
                    needsRecommendUpdate: false,
                    latestVersion: currentVersion,
                    message: '',
                    storeUrl: '',
                };
            }

            const storeUrl = platform === 'ios' ? versionInfo.iosStoreUrl : versionInfo.androidStoreUrl;
            const needsForceUpdate = this.compareVersions(currentVersion, versionInfo.minRequiredVersion) < 0;
            const needsRecommendUpdate =
                !needsForceUpdate && this.compareVersions(currentVersion, versionInfo.latestVersion) < 0;

            const message = needsForceUpdate
                ? versionInfo.forceUpdateMessage
                : needsRecommendUpdate
                  ? versionInfo.recommendUpdateMessage
                  : '';

            this.logger.logSuccess('checkVersion', '앱 버전 체크 완료', {
                needsForceUpdate,
                needsRecommendUpdate,
                latestVersion: versionInfo.latestVersion,
            });

            return {
                needsForceUpdate,
                needsRecommendUpdate,
                latestVersion: versionInfo.latestVersion,
                message,
                storeUrl,
            };
        } catch (error) {
            this.logger.logError('checkVersion', '앱 버전 체크', error);
            throw new BadRequestException('버전 체크에 실패했습니다.');
        }
    }

    /**
     * 버전 문자열 비교 유틸리티 (semver 패키지 없이 직접 구현)
     * "1.2.3" 형태의 버전 비교
     * @returns a < b이면 -1, a === b이면 0, a > b이면 1
     */
    private compareVersions(a: string, b: string): number {
        const pa = a.split('.').map(Number);
        const pb = b.split('.').map(Number);

        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
            const na = pa[i] ?? 0;
            const nb = pb[i] ?? 0;

            if (na < nb) return -1;
            if (na > nb) return 1;
        }

        return 0;
    }
}
