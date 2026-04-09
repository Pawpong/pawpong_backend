import { Injectable } from '@nestjs/common';

export function buildAllNotificationsMarkedReadMessage(updatedCount: number): string {
    return `${updatedCount}개의 알림이 읽음 처리되었습니다.`;
}

export const NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES = {
    notificationsListed: '알림 목록이 조회되었습니다.',
    unreadCountRetrieved: '읽지 않은 알림 수가 조회되었습니다.',
    notificationMarkedRead: '알림이 읽음 처리되었습니다.',
    allNotificationsMarkedRead: buildAllNotificationsMarkedReadMessage(3),
    notificationDeleted: '알림이 삭제되었습니다.',
    notificationStatsRetrieved: '알림 통계가 조회되었습니다.',
} as const;

@Injectable()
export class NotificationResponseMessageService {
    notificationsListed(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationsListed;
    }

    unreadCountRetrieved(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.unreadCountRetrieved;
    }

    notificationMarkedRead(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationMarkedRead;
    }

    allNotificationsMarkedRead(updatedCount: number): string {
        return buildAllNotificationsMarkedReadMessage(updatedCount);
    }

    notificationDeleted(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationDeleted;
    }

    notificationStatsRetrieved(): string {
        return NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationStatsRetrieved;
    }
}
