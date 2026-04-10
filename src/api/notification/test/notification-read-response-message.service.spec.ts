import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';
import { NotificationReadResponseMessageService } from '../domain/services/notification-read-response-message.service';

describe('알림 읽음 응답 메시지 서비스', () => {
    const service = new NotificationReadResponseMessageService();

    it('읽음 처리 메시지 계약을 유지한다', () => {
        expect(service.notificationMarkedRead()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationMarkedRead);
    });

    it('전체 읽음 처리 메시지를 기존 형식으로 만든다', () => {
        expect(service.allNotificationsMarkedRead(3)).toBe('3개의 알림이 읽음 처리되었습니다.');
        expect(service.allNotificationsMarkedRead(0)).toBe('0개의 알림이 읽음 처리되었습니다.');
    });
});
