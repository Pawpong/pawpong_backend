import { Injectable } from '@nestjs/common';

import { DomainAuthorizationError, DomainValidationError } from '../../../../../common/error/domain.error';
import {
    AdopterAdminAdminSnapshot,
    AdopterAdminApplicationDetailSnapshot,
} from '../../application/ports/adopter-admin-reader.port';
import { AdopterAdminDeletedReviewSnapshot } from '../../application/ports/adopter-admin-writer.port';

@Injectable()
export class AdopterAdminPolicyService {
    assertCanManageReports(admin: AdopterAdminAdminSnapshot | null): AdopterAdminAdminSnapshot {
        if (!admin || !admin.permissions?.canManageReports) {
            throw new DomainAuthorizationError('Access denied');
        }

        return admin;
    }

    assertCanViewStatistics(admin: AdopterAdminAdminSnapshot | null): AdopterAdminAdminSnapshot {
        if (!admin || !admin.permissions?.canViewStatistics) {
            throw new DomainAuthorizationError('통계 조회 권한이 없습니다.');
        }

        return admin;
    }

    assertReviewExists(review: AdopterAdminDeletedReviewSnapshot | null): AdopterAdminDeletedReviewSnapshot {
        if (!review) {
            throw new DomainValidationError('후기를 찾을 수 없습니다.');
        }

        return review;
    }

    assertApplicationExists(
        application: AdopterAdminApplicationDetailSnapshot | null,
    ): AdopterAdminApplicationDetailSnapshot {
        if (!application) {
            throw new DomainValidationError('해당 입양 신청을 찾을 수 없습니다.');
        }

        return application;
    }
}
