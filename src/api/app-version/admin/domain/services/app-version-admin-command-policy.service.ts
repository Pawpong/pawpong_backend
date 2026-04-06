import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AppVersionAdminCommandPolicyService {
    ensureAdminId(adminId: string): void {
        if (!adminId) {
            throw new BadRequestException('관리자 정보가 올바르지 않습니다.');
        }
    }

    ensureAppVersionId(appVersionId: string): void {
        if (!appVersionId) {
            throw new BadRequestException('앱 버전 ID가 필요합니다.');
        }
    }
}
