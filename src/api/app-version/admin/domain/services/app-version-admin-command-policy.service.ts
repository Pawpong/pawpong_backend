import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../../common/error/domain.error';

/**
 * 앱 버전 어드민 명령 정책.
 *
 * 강제 업데이트는 잘못 설정되면 전체 사용자를 즉시 앱에서 차단(브릭)하므로
 * 입력값을 도메인 레벨에서 한 번 더 검증한다.
 *
 * - semver 형식 (숫자.숫자.숫자[.숫자]+) 만 허용
 * - minRequiredVersion 은 latestVersion 보다 클 수 없음 (브릭 방지)
 */
@Injectable()
export class AppVersionAdminCommandPolicyService {
    /** Apple/Google 도 사실상 숫자 dot 형태만 받으므로 표준 semver(prerelease 제외) 만 허용 */
    private static readonly SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:\.\d+)?$/;

    ensureAdminId(adminId: string): void {
        if (!adminId) {
            throw new DomainValidationError('관리자 정보가 올바르지 않습니다.');
        }
    }

    ensureAppVersionId(appVersionId: string): void {
        if (!appVersionId) {
            throw new DomainValidationError('앱 버전 ID가 필요합니다.');
        }
    }

    /**
     * 버전 문자열이 1.2.3 형태인지 검증.
     * 빈 문자열/undefined 는 호출 측에서 거른다.
     */
    ensureSemverFormat(version: string, fieldName: string): void {
        if (!AppVersionAdminCommandPolicyService.SEMVER_PATTERN.test(version)) {
            throw new DomainValidationError(`${fieldName} 형식이 올바르지 않습니다. 예: 1.2.0 (숫자.숫자.숫자)`);
        }
    }

    /**
     * minRequiredVersion <= latestVersion 강제.
     * 두 값 모두 ensureSemverFormat 으로 사전 검증되어 있어야 한다.
     */
    ensureMinRequiredNotAboveLatest(minRequiredVersion: string, latestVersion: string): void {
        if (this.compareVersions(minRequiredVersion, latestVersion) > 0) {
            throw new DomainValidationError(
                '최소 요구 버전이 최신 버전보다 클 수 없습니다. 강제 업데이트로 모든 사용자가 앱에서 차단됩니다.',
            );
        }
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
