import { Injectable } from '@nestjs/common';

import { AdminAction, VerificationStatus } from '../../../../../../common/enum/user.enum';
import {
    DomainAuthorizationError,
    DomainConflictError,
    DomainValidationError,
} from '../../../../../../common/error/domain.error';
import {
    BreederVerificationAdminAdminSnapshot,
    BreederVerificationAdminBreederSnapshot,
} from '../../application/ports/breeder-verification-admin-reader.port';

@Injectable()
export class BreederVerificationAdminPolicyService {
    /** 완료된 심사를 덮어쓰거나 동일 상태 알림을 재발송하지 않는다. */
    assertVerificationTransition(current: string | undefined, next: VerificationStatus): string {
        const allowed =
            current === VerificationStatus.PENDING
                ? [VerificationStatus.REVIEWING, VerificationStatus.APPROVED, VerificationStatus.REJECTED]
                : current === VerificationStatus.REVIEWING
                  ? [VerificationStatus.APPROVED, VerificationStatus.REJECTED]
                  : [];
        if (!current || !allowed.includes(next)) {
            throw new DomainConflictError(
                '이미 처리되었거나 변경할 수 없는 심사 상태입니다. 새로고침 후 확인해주세요.',
            );
        }
        return current;
    }

    assertCanManageBreeders(
        admin: BreederVerificationAdminAdminSnapshot | null,
        message: string,
    ): BreederVerificationAdminAdminSnapshot {
        if (!admin || !admin.permissions?.canManageBreeders) {
            throw new DomainAuthorizationError(message);
        }

        return admin;
    }

    assertBreederExists(
        breeder: BreederVerificationAdminBreederSnapshot | null,
    ): BreederVerificationAdminBreederSnapshot {
        if (!breeder) {
            throw new DomainValidationError('브리더를 찾을 수 없습니다.');
        }

        return breeder;
    }

    assertVerificationRequestExists(
        breeder: BreederVerificationAdminBreederSnapshot,
    ): BreederVerificationAdminBreederSnapshot {
        if (!breeder.verification) {
            throw new DomainValidationError('No verification request found');
        }

        return breeder;
    }

    resolveAdminAction(verificationStatus: VerificationStatus): AdminAction {
        if (verificationStatus === VerificationStatus.APPROVED) {
            return AdminAction.APPROVE_BREEDER;
        }

        if (verificationStatus === VerificationStatus.REJECTED) {
            return AdminAction.REJECT_BREEDER;
        }

        return AdminAction.REVIEW_BREEDER;
    }

    getBreederDisplayName(breeder: BreederVerificationAdminBreederSnapshot): string {
        return breeder.nickname || breeder.name || '브리더';
    }
}
