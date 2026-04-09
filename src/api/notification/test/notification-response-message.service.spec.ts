import {
    NotificationResponseMessageService,
    NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES,
} from '../domain/services/notification-response-message.service';

describe('알림 응답 메시지 서비스', () => {
    const service = new NotificationResponseMessageService();

    it('공개 경로와 관리자 경로가 공유하는 메시지 계약을 유지한다', () => {
        expect(service.notificationsListed()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationsListed);
        expect(service.unreadCountRetrieved()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.unreadCountRetrieved);
        expect(service.notificationMarkedRead()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationMarkedRead);
        expect(service.notificationDeleted()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationDeleted);
        expect(service.notificationStatsRetrieved()).toBe(
            NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationStatsRetrieved,
        );
    });

    it('전체 읽음 처리 메시지를 기존 형식으로 만든다', () => {
        expect(service.allNotificationsMarkedRead(3)).toBe('3개의 알림이 읽음 처리되었습니다.');
        expect(service.allNotificationsMarkedRead(0)).toBe('0개의 알림이 읽음 처리되었습니다.');
    });
});
