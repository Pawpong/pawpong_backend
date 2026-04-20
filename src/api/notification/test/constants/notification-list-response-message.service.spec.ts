import { NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/notification-response-messages';

describe('알림 목록 응답 메시지 상수', () => {
    it('알림 목록 조회 메시지 계약을 유지한다', () => {
        expect(NOTIFICATION_RESPONSE_MESSAGE_EXAMPLES.notificationsListed).toBe('알림 목록이 조회되었습니다.');
    });
});
