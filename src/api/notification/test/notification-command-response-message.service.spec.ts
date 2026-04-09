import { NotificationCommandResponseMessageService } from '../domain/services/notification-command-response-message.service';
import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notification-response-messages';

describe('알림 명령 응답 메시지 서비스', () => {
    const service = new NotificationCommandResponseMessageService();

    it('읽음 처리와 삭제 메시지 계약을 유지한다', () => {
        expect(service.notificationMarkedRead()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationMarkedRead);
        expect(service.notificationDeleted()).toBe(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationDeleted);
    });

    it('전체 읽음 처리 메시지를 기존 형식으로 만든다', () => {
        expect(service.allNotificationsMarkedRead(3)).toBe('3개의 알림이 읽음 처리되었습니다.');
        expect(service.allNotificationsMarkedRead(0)).toBe('0개의 알림이 읽음 처리되었습니다.');
    });
});
