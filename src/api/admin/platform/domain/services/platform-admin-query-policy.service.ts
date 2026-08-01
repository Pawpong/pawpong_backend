import { Injectable } from '@nestjs/common';

import { DomainAuthorizationError } from '../../../../../common/error/domain.error';
import { PlatformAdminAdminSnapshot } from '../../application/ports/platform-admin-reader.port';

@Injectable()
export class PlatformAdminQueryPolicyService {
    assertCanViewStatistics(admin: PlatformAdminAdminSnapshot | null, message: string): PlatformAdminAdminSnapshot {
        if (!admin || !admin.permissions?.canViewStatistics) {
            throw new DomainAuthorizationError(message);
        }

        return admin;
    }
}
