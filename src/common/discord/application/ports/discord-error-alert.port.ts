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
    sendCriticalErrorAlert(request: DiscordErrorAlertRequest): Promise<void>;
}

/** Discord 에러 알림 Port 주입 토큰 */
export const DISCORD_ERROR_ALERT_PORT = Symbol('DISCORD_ERROR_ALERT_PORT');
