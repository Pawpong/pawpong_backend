import { NotificationStateResultMapperService } from '../../../domain/services/notification-state-result-mapper.service';

describe('알림 상태 결과 매퍼', () => {
    it('읽지 않은 알림 수 결과 계약을 유지한다', () => {
        const service = new NotificationStateResultMapperService();

        expect(service.toUnreadCountResult(3)).toEqual({ unreadCount: 3 });
    });
});
