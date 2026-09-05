import { BadRequestException, Injectable } from '@nestjs/common';

import type { AdminPushTarget } from '../../application/types/admin-push.type';

/**
 * v2 어드민 푸시 target 검증.
 * - type='individual' → userId/role 필수
 * - type='all_*' → userId/role 무시 (있어도 무관)
 *
 * class-validator 로는 cross-field 분기가 까다로워 도메인에서 강제.
 */
@Injectable()
export class AdminPushTargetValidatorService {
    validate(target: AdminPushTarget): void {
        if (target.type === 'individual') {
            if (!target.userId || target.userId.trim().length === 0) {
                throw new BadRequestException('개별 발송은 userId가 필요합니다.');
            }
            if (target.role !== 'adopter' && target.role !== 'breeder') {
                throw new BadRequestException('개별 발송 role 은 adopter 또는 breeder 여야 합니다.');
            }
            return;
        }

        if (target.type !== 'all_adopters' && target.type !== 'all_breeders') {
            throw new BadRequestException('지원하지 않는 발송 대상입니다.');
        }
    }
}
