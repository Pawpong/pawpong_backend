import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../../common/error/domain.error';

@Injectable()
export class AppVersionAdminCommandPolicyService {
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
}
