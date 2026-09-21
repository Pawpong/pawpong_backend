import { OpsAlertReminderPolicyService } from '../../../domain/services/ops-alert-reminder-policy.service';

describe('OpsAlertReminderPolicyService', () => {
    const policy = new OpsAlertReminderPolicyService();
    const SIX_HOURS = 6 * 60 * 60 * 1000;

    it('첫 알림 6시간 뒤에 첫 리마인드를 잡는다', () => {
        const deliveredAt = new Date('2026-09-20T00:00:00.000Z');

        expect(policy.getFirstRemindAt(deliveredAt).toISOString()).toBe('2026-09-20T06:00:00.000Z');
    });

    it('리마인드는 6시간 간격으로 이어진다', () => {
        const sentAt = new Date('2026-09-20T06:00:00.000Z');

        expect(policy.getNextRemindAt(sentAt, 1)?.getTime()).toBe(sentAt.getTime() + SIX_HOURS);
    });

    it('4회를 채우면 더 보내지 않는다', () => {
        const sentAt = new Date('2026-09-21T00:00:00.000Z');

        // 마지막(4회차)을 보낸 뒤에는 다음 예정이 없어야 방이 계속 울리지 않는다
        expect(policy.getNextRemindAt(sentAt, 4)).toBeUndefined();
        expect(policy.getMaxRemindCount()).toBe(4);
    });

    it('방치 시간을 분/시간/일 단위로 읽어준다', () => {
        const createdAt = new Date('2026-09-20T00:00:00.000Z');

        expect(policy.describeElapsed(createdAt, new Date('2026-09-20T00:30:00.000Z'))).toBe('30분');
        expect(policy.describeElapsed(createdAt, new Date('2026-09-20T07:00:00.000Z'))).toBe('7시간');
        expect(policy.describeElapsed(createdAt, new Date('2026-09-21T09:00:00.000Z'))).toBe('1일 9시간');
    });
});
