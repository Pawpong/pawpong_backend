/** 계정 사용 중단 시 HTTP 세션·푸시·실시간 연결을 함께 폐기하는 인증 이벤트. */
export const ACCOUNT_ACCESS_REVOKED = 'account.access.revoked';

export interface AccountAccessRevokedEvent {
    userId: string;
    role: 'adopter' | 'breeder';
}
