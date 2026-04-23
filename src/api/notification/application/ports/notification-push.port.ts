export const NOTIFICATION_PUSH_PORT = Symbol('NOTIFICATION_PUSH_PORT');

/**
 * 푸시 발송 시 디바이스가 받을 페이로드
 */
export interface NotificationPushMessage {
    /** 디바이스에 표시될 제목 */
    title: string;
    /** 디바이스에 표시될 본문 */
    body: string;
    /** 앱이 알림 탭 시 이동할 경로 (RN WebView routing) */
    targetUrl?: string;
    /** 백그라운드에서 전달할 추가 데이터 (모두 string) */
    data?: Record<string, string>;
}

/**
 * 푸시 발송 결과 한 건
 */
export interface NotificationPushDeliveryResult {
    /** 발송 대상 토큰 */
    token: string;
    /** 발송 성공 여부 */
    success: boolean;
    /** 무효 토큰 여부 (true면 DB에서 제거 대상) */
    invalidToken: boolean;
    /** 실패 시 원인 (디버깅 용도) */
    error?: string;
}

/**
 * 푸시 발송 포트
 * 어댑터가 Firebase Admin SDK 등 외부 플랫폼을 추상화합니다.
 */
export interface NotificationPushPort {
    /**
     * 여러 디바이스 토큰에 동시 발송.
     * 일부 실패는 per-token 결과 배열로 반환됩니다.
     */
    sendToTokens(tokens: string[], message: NotificationPushMessage): Promise<NotificationPushDeliveryResult[]>;
}
