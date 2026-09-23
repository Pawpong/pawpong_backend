export const NOTIFICATION_DEVICE_REGISTRY_PORT = Symbol('NOTIFICATION_DEVICE_REGISTRY_PORT');

/**
 * 계정과 무관한 기기 등록 커맨드
 */
export interface RegisterAnonymousDeviceCommand {
    token: string;
    platform?: 'ios' | 'android';
    appVersion?: string;
}

/**
 * 기기 등록 결과
 */
export interface RegisterAnonymousDeviceResult {
    /** 이번 호출로 처음 등록된 기기인지 */
    isNewDevice: boolean;
}

/**
 * 기기 레지스트리 포트
 *
 * 로그인 이전의 기기를 다룬다. 계정에 묶인 토큰은 NotificationPushTokenStorePort가 담당하며,
 * 둘은 로그인 시점에 bindToUser로 연결된다.
 */
export interface NotificationDeviceRegistryPort {
    /** 기기 등록 또는 마지막 접속 갱신 (계정 바인딩은 건드리지 않음) */
    registerDevice(command: RegisterAnonymousDeviceCommand): Promise<RegisterAnonymousDeviceResult>;

    /** 로그인한 계정에 기기를 바인딩 */
    bindToUser(token: string, userId: string, userRole: string): Promise<void>;

    /** 로그아웃 시 바인딩 해제 (기기 레코드는 유지) */
    unbind(token: string, userId: string, userRole: string): Promise<void>;

    /** 설치 안내 푸시 발송 완료 표시 */
    markWelcomeSent(token: string): Promise<void>;

    /** 무효 토큰 제거 */
    removeTokens(tokens: string[]): Promise<void>;
}
