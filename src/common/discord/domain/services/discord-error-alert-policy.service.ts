import { Injectable } from '@nestjs/common';

import type { DiscordErrorAlertRequest } from '../../application/ports/discord-error-alert.port';

/**
 * Discord 에러 알림 정책 서비스
 *
 * 어떤 에러를 운영 알림으로 보낼지와 중복 알림 기준을 결정합니다.
 */
@Injectable()
export class DiscordErrorAlertPolicyService {
    /** 같은 에러는 기본 5분 동안 재전송하지 않습니다. */
    private static readonly DEFAULT_COOLDOWN_MS = 5 * 60 * 1000;

    /**
     * Discord 알림 대상 여부를 판단합니다.
     *
     * 4xx 계열 요청 오류는 사용자 입력/인증/봇 스캔일 가능성이 높아 제외하고,
     * 5xx 또는 HTTP 상태 코드가 없는 인프라/애플리케이션 에러만 알림 대상으로 봅니다.
     */
    shouldNotify(request: DiscordErrorAlertRequest): boolean {
        if (!request.context || !request.message) {
            return false;
        }

        if (request.statusCode && request.statusCode < 500) {
            return false;
        }

        return request.severity === 'critical' || request.severity === 'error';
    }

    /**
     * 중복 알림 방지 키를 생성합니다.
     */
    buildDeduplicationKey(request: DiscordErrorAlertRequest): string {
        const normalizedMessage = request.message.replace(/\s+/g, ' ').trim().slice(0, 180);

        return [
            request.context,
            request.statusCode ?? 'no-status',
            request.method ?? 'no-method',
            request.path ?? 'no-path',
            normalizedMessage,
        ].join('|');
    }

    /**
     * 중복 알림 쿨다운 시간을 반환합니다.
     */
    getCooldownMs(): number {
        return DiscordErrorAlertPolicyService.DEFAULT_COOLDOWN_MS;
    }
}
