import { BadRequestException, Injectable } from '@nestjs/common';

import type { AdminPushTarget } from '../../application/types/admin-push.type';
import {
    isSafeAppTargetPath,
    DEEP_LINK_SLUG_PATTERN,
} from '../../../../service/deep-link/domain/services/deep-link-policy';

/**
 * v2 어드민 푸시 target 검증.
 * - type='individual' → userId/role 필수
 * - type='all_*' → userId/role 무시 (있어도 무관)
 *
 * class-validator 로는 cross-field 분기가 까다로워 도메인에서 강제.
 */
@Injectable()
export class AdminPushTargetValidatorService {
    /** 앱 내부 경로 또는 직접 호스팅하는 Pawpong 공유 링크만 발송한다. */
    validateTargetUrl(targetUrl?: string): void {
        if (targetUrl === undefined || targetUrl === '') return;
        if (typeof targetUrl !== 'string') throw new BadRequestException('이동 URL이 올바르지 않습니다.');
        if (isSafeAppTargetPath(targetUrl)) return;
        const isSharePath = (path: string) =>
            path.startsWith('/l/') && path.slice(3).length <= 80 && DEEP_LINK_SLUG_PATTERN.test(path.slice(3));
        if (isSharePath(targetUrl)) return;
        try {
            const url = new URL(targetUrl);
            if (
                url.protocol === 'https:' &&
                ['pawpong.kr', 'www.pawpong.kr', 'dev.pawpong.kr'].includes(url.hostname) &&
                !url.port &&
                !url.username &&
                !url.password &&
                !url.search &&
                !url.hash &&
                isSharePath(url.pathname) &&
                targetUrl === url.href
            )
                return;
        } catch {
            /* 아래의 동일 검증 오류로 응답한다. */
        }
        throw new BadRequestException('이동 URL은 앱 내부 경로 또는 Pawpong 공유 링크여야 합니다.');
    }

    validate(target: AdminPushTarget): void {
        if (!target || typeof target !== 'object') throw new BadRequestException('발송 대상이 필요합니다.');
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
