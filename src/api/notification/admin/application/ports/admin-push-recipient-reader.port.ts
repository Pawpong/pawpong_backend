import type { AdminPushRecipientSnapshot, AdminPushTarget } from '../types/admin-push.type';

export const ADMIN_PUSH_RECIPIENT_READER_PORT = Symbol('ADMIN_PUSH_RECIPIENT_READER_PORT');

export interface AdminPushRecipientReaderPort {
    /**
     * target 별로 알림 받을 사용자 + 디바이스 토큰을 일괄 조회.
     * - all_adopters / all_breeders: 활성 사용자 전체에서 토큰 보유자만
     * - individual: 단일 사용자 (없거나 비활성이면 빈 결과)
     */
    readRecipients(target: AdminPushTarget): Promise<AdminPushRecipientSnapshot[]>;
}
