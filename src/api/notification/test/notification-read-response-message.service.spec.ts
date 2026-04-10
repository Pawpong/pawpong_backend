import {
    buildAllNotificationsMarkedReadMessage,
    NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES,
} from '../constants/notification-response-messages';

describe('알림 읽음 응답 메시지 상수', () => {
    it('읽음 처리 메시지 계약을 유지한다', () => {
        expect(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationMarkedRead).toBe('알림이 읽음 처리되었습니다.');
    });

    it('전체 읽음 처리 메시지를 기존 형식으로 만든다', () => {
        expect(buildAllNotificationsMarkedReadMessage(3)).toBe('3개의 알림이 읽음 처리되었습니다.');
        expect(buildAllNotificationsMarkedReadMessage(0)).toBe('0개의 알림이 읽음 처리되었습니다.');
    });
});
