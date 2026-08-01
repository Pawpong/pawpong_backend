import { BreederAdminReminderResultMapperService } from '../../../domain/services/breeder-admin-reminder-result-mapper.service';

describe('BreederAdminReminderResultMapperService', () => {
    const service = new BreederAdminReminderResultMapperService();

    it('성공/실패 카운트를 계산한다', () => {
        const sentAt = new Date();
        const result = service.toResult(5, ['s1', 's2'], ['f1'], sentAt);
        expect(result.totalCount).toBe(5);
        expect(result.successCount).toBe(2);
        expect(result.failCount).toBe(1);
        expect(result.sentAt).toBe(sentAt);
    });

    it('빈 배열을 처리한다', () => {
        const result = service.toResult(0, [], [], new Date());
        expect(result.successCount).toBe(0);
        expect(result.failCount).toBe(0);
    });
});
