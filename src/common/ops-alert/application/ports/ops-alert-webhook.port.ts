export const OPS_ALERT_WEBHOOK_PORT = Symbol('OPS_ALERT_WEBHOOK_PORT');

/**
 * 운영 알림 발송 경계.
 *
 * 종류별로 다른 디스코드 방을 쓰므로, 보낼 방이 있는지부터 물어보고 전송한다.
 */
export interface OpsAlertWebhookPort {
    /**
     * 이 환경에서 해당 종류의 알림을 보낼 방이 있는지.
     * 로컬처럼 보낼 곳이 없는 환경을 전송 실패로 기록하지 않기 위해 먼저 확인한다.
     */
    isEnabled(kind: string): boolean;

    /** 디스코드 embed payload 전송 (실패 시 예외) */
    send(kind: string, payload: Record<string, unknown>): Promise<void>;
}
