import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';

import {
    AdopterAdminAdminSnapshot,
    AdopterAdminApplicationDetailSnapshot,
} from '../../application/ports/adopter-admin-reader.port';
import { AdopterAdminDeletedReviewSnapshot } from '../../application/ports/adopter-admin-writer.port';

@Injectable()
export class AdopterAdminPolicyService {
    assertCanManageReports(admin: AdopterAdminAdminSnapshot | null): AdopterAdminAdminSnapshot {
        if (!admin || !admin.permissions?.canManageReports) {
            throw new ForbiddenException('Access denied');
        }

        return admin;
    }

    assertCanViewStatistics(admin: AdopterAdminAdminSnapshot | null): AdopterAdminAdminSnapshot {
        if (!admin || !admin.permissions?.canViewStatistics) {
            throw new ForbiddenException('통계 조회 권한이 없습니다.');
        }

        return admin;
    }

    assertReviewExists(review: AdopterAdminDeletedReviewSnapshot | null): AdopterAdminDeletedReviewSnapshot {
        if (!review) {
            throw new BadRequestException('후기를 찾을 수 없습니다.');
        }

        return review;
    }

    assertApplicationIdFormat(applicationId: string): void {
        if (!/^[a-fA-F0-9]{24}$/.test(applicationId)) {
            throw new BadRequestException('올바르지 않은 신청 ID 형식입니다.');
        }
    }

    assertApplicationExists(
        application: AdopterAdminApplicationDetailSnapshot | null,
    ): AdopterAdminApplicationDetailSnapshot {
        if (!application) {
            throw new BadRequestException('해당 입양 신청을 찾을 수 없습니다.');
        }

        return application;
    }
}
