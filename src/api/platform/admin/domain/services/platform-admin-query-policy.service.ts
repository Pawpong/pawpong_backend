import { ForbiddenException, Injectable } from '@nestjs/common';

import { PlatformAdminAdminSnapshot } from '../../application/ports/platform-admin-reader.port';

@Injectable()
export class PlatformAdminQueryPolicyService {
    assertCanViewStatistics(admin: PlatformAdminAdminSnapshot | null, message: string): PlatformAdminAdminSnapshot {
        if (!admin || !admin.permissions?.canViewStatistics) {
            throw new ForbiddenException(message);
        }

        return admin;
    }
}
