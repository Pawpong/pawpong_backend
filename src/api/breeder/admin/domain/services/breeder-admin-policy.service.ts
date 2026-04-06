import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';

import { VerificationStatus } from '../../../../../common/enum/user.enum';
import {
    BreederAdminAdminSnapshot,
    BreederAdminBreederSnapshot,
} from '../../application/ports/breeder-admin-reader.port';

@Injectable()
export class BreederAdminPolicyService {
    assertCanManageBreeders(admin: BreederAdminAdminSnapshot | null): BreederAdminAdminSnapshot {
        if (!admin || !admin.permissions?.canManageBreeders) {
            throw new ForbiddenException('브리더 관리 권한이 없습니다.');
        }

        return admin;
    }

    assertBreederExists(breeder: BreederAdminBreederSnapshot | null): BreederAdminBreederSnapshot {
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        return breeder;
    }

    assertSuspendable(breeder: BreederAdminBreederSnapshot): BreederAdminBreederSnapshot {
        if (breeder.accountStatus === 'suspended') {
            throw new BadRequestException('이미 정지된 계정입니다.');
        }

        return breeder;
    }

    assertUnsuspendable(breeder: BreederAdminBreederSnapshot): BreederAdminBreederSnapshot {
        if (breeder.accountStatus !== 'suspended') {
            throw new BadRequestException('정지 상태가 아닌 계정입니다.');
        }

        return breeder;
    }

    canSendReminder(breeder: BreederAdminBreederSnapshot, requiredStatus: VerificationStatus): boolean {
        return breeder.verification?.status === requiredStatus;
    }

    getBreederNickname(breeder: BreederAdminBreederSnapshot): string {
        return breeder.nickname || breeder.name || '브리더';
    }

    getBreederBusinessName(breeder: BreederAdminBreederSnapshot): string {
        return breeder.name || breeder.nickname || '브리더';
    }
}
