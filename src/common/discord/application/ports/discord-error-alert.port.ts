/**
 * Discord 에러 알림 심각도
 */
export type DiscordErrorAlertSeverity = 'error' | 'critical';

/**
 * Discord 에러 알림 요청
 */
export interface DiscordErrorAlertRequest {
    severity: DiscordErrorAlertSeverity;
    context: string;
    message: string;
    statusCode?: number;
    method?: string;
    path?: string;
    stack?: string;
    userId?: string;
    timestamp?: Date;
    metadata?: Record<string, unknown>;
}

/**
 * Discord 에러 알림 발송 Port
 *
 * 외부 시스템(Discord Webhook) 의존성을 애플리케이션 계층 밖으로 분리합니다.
 */
export interface DiscordErrorAlertPort {
    /**
     * 이 환경이 알림 대상인지 알려준다.
     * 로컬처럼 보낼 방이 없는 환경을 전송 실패로 기록하지 않기 위해 호출 전에 확인한다.
     */
    isAlertEnabled(): boolean;

    sendCriticalErrorAlert(request: DiscordErrorAlertRequest): Promise<void>;
}

/** Discord 에러 알림 Port 주입 토큰 */
export const DISCORD_ERROR_ALERT_PORT = Symbol('DISCORD_ERROR_ALERT_PORT');
