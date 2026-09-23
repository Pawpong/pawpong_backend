import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../../common/error/domain.error';
import { ActiveAppVersionSnapshot } from '../../application/ports/app-version-reader.port';
import { isAppStoreUrl } from './app-version-store-url.policy';

@Injectable()
export class AppVersionPolicyService {
    ensureCheckRequest(platform: 'ios' | 'android', currentVersion: string): void {
        if (
            (platform !== 'ios' && platform !== 'android') ||
            typeof currentVersion !== 'string' ||
            !/^\d+\.\d+\.\d+(?:\.\d+)?$/.test(currentVersion) ||
            currentVersion.length > 40 ||
            currentVersion.split('.').some((part) => !Number.isSafeInteger(Number(part)))
        ) {
            throw new DomainValidationError('플랫폼과 현재 버전 정보가 필요합니다.');
        }
    }

    buildCheckResponse(
        platform: 'ios' | 'android',
        currentVersion: string,
        versionInfo: ActiveAppVersionSnapshot | null,
    ) {
        // 기존 DB에 잘못된 주소가 남아 있어도 이동할 수 없는 강제 업데이트로 앱을 잠그지 않는다.
        const storeUrl = versionInfo && (platform === 'ios' ? versionInfo.iosStoreUrl : versionInfo.androidStoreUrl);
        if (!versionInfo || !storeUrl || !isAppStoreUrl(storeUrl, platform)) {
            return {
                needsForceUpdate: false,
                needsRecommendUpdate: false,
                latestVersion: currentVersion,
                message: '',
                storeUrl: '',
            };
        }

        const needsForceUpdate = this.compareVersions(currentVersion, versionInfo.minRequiredVersion) < 0;
        const needsRecommendUpdate =
            !needsForceUpdate && this.compareVersions(currentVersion, versionInfo.latestVersion) < 0;

        const message = needsForceUpdate
            ? versionInfo.forceUpdateMessage
            : needsRecommendUpdate
              ? versionInfo.recommendUpdateMessage
              : '';

        return {
            ...(versionInfo.appIconKey ? { appIconKey: versionInfo.appIconKey } : {}),
            needsForceUpdate,
            needsRecommendUpdate,
            latestVersion: versionInfo.latestVersion,
            message,
            storeUrl,
        };
    }

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
