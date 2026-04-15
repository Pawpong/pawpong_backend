import { Injectable } from '@nestjs/common';

import { AdminAction, VerificationStatus } from '../../../../../../common/enum/user.enum';
import { DomainAuthorizationError, DomainValidationError } from '../../../../../../common/error/domain.error';
import {
    BreederVerificationAdminAdminSnapshot,
    BreederVerificationAdminBreederSnapshot,
} from '../../application/ports/breeder-verification-admin-reader.port';

@Injectable()
export class BreederVerificationAdminPolicyService {
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

    resolveAdminAction(verificationStatus: string): AdminAction {
        if (verificationStatus === VerificationStatus.APPROVED) {
            return AdminAction.APPROVE_BREEDER;
        }

        if (verificationStatus === VerificationStatus.REJECTED) {
            return AdminAction.REJECT_BREEDER;
        }

        return AdminAction.REVIEW_BREEDER;
    }

    isLevelChangeApproval(breeder: BreederVerificationAdminBreederSnapshot, verificationStatus: string): boolean {
        return (
            !!breeder.verification?.isLevelChangeRequested &&
            !!breeder.verification?.levelChangeRequest &&
            verificationStatus === VerificationStatus.APPROVED
        );
    }

    shouldClearLevelChangeRequest(breeder: BreederVerificationAdminBreederSnapshot, verificationStatus: string): boolean {
        return (
            !!breeder.verification?.isLevelChangeRequested &&
            (verificationStatus === VerificationStatus.APPROVED || verificationStatus === VerificationStatus.REJECTED)
        );
    }

    getBreederDisplayName(breeder: BreederVerificationAdminBreederSnapshot): string {
        return breeder.nickname || breeder.name || '브리더';
    }
}
