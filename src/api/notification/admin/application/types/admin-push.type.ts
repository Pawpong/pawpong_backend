import type { NotificationUserRole } from '../../../application/ports/notification-command.port';

/**
 * v2 어드민 푸시 — application 계층 command/snapshot 타입.
 *
 * target 4가지: 입양자 전체 / 브리더 전체 / 개별 입양자 / 개별 브리더.
 * 발송 결과는 알림 doc 생성 수 + FCM 토큰 시도/성공/실패/무효 카운트를 함께 반환.
 */

export type AdminPushTarget =
    | { type: 'all_adopters' }
    | { type: 'all_breeders' }
    | { type: 'individual'; role: NotificationUserRole; userId: string };

export interface SendAdminPushCommand {
    target: AdminPushTarget;
    title: string;
    body: string;
    targetUrl?: string;
}

export interface AdminPushRecipientSnapshot {
    userId: string;
    userRole: NotificationUserRole;
    tokens: string[];
}

export interface AdminPushDispatchResult {
    recipients: number;
    notificationsCreated: number;
    pushTokensTargeted: number;
    pushSuccess: number;
    pushFailed: number;
    invalidTokens: number;
}
