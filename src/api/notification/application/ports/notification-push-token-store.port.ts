import type { NotificationUserRole } from './notification-command.port';

export const NOTIFICATION_PUSH_TOKEN_STORE_PORT = Symbol('NOTIFICATION_PUSH_TOKEN_STORE_PORT');

/**
 * 푸시 토큰 등록 커맨드
 */
export interface RegisterPushDeviceTokenCommand {
    userId: string;
    userRole: NotificationUserRole;
    token: string;
    platform: 'ios' | 'android';
    appVersion?: string;
}

/**
 * 푸시 토큰 해제 커맨드
 */
export interface UnregisterPushDeviceTokenCommand {
    userId: string;
    userRole: NotificationUserRole;
    token: string;
}

/**
 * 사용자가 가진 디바이스 토큰 목록 조회 결과
 */
export interface UserPushDeviceTokens {
    userId: string;
    userRole: NotificationUserRole;
    tokens: string[];
}

/**
 * 푸시 디바이스 토큰 스토어 포트
 *
 * adopter/breeder 도메인의 스키마에 저장된 pushDeviceTokens 컬렉션을 추상화합니다.
 * 구현체(어댑터)는 adopter/breeder 모델을 직접 다루며, notification 도메인은 이 포트만 의존합니다.
 */
export interface NotificationPushTokenStorePort {
    /**
     * 토큰 등록 (이미 존재하면 registeredAt 갱신).
     */
    register(command: RegisterPushDeviceTokenCommand): Promise<void>;

    /**
     * 토큰 해제 (로그아웃 또는 알림 거부 시).
     */
    unregister(command: UnregisterPushDeviceTokenCommand): Promise<void>;

    /**
     * 무효 판정된 토큰을 DB에서 제거 (FCM 발송 실패 정리용).
     */
    purgeInvalidTokens(userId: string, userRole: NotificationUserRole, tokens: string[]): Promise<void>;

    /**
     * 사용자의 활성 디바이스 토큰 조회.
     */
    findTokensByUser(userId: string, userRole: NotificationUserRole): Promise<UserPushDeviceTokens>;
}
