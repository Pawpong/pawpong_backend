import { AiImageQuotaService } from '../domain/services/ai-image-quota.service';

describe('AiImageQuotaService', () => {
    const service = new AiImageQuotaService();

    it('일일 쿼터는 KST 자정부터 센다 (UTC 15:00 경계)', () => {
        // 9/26 08:30 KST = 9/25 23:30 UTC → 그날 KST 자정은 9/25 15:00 UTC
        expect(service.startOfKstDay(new Date('2026-09-25T23:30:00Z')).toISOString()).toBe('2026-09-25T15:00:00.000Z');
        // 9/26 00:10 KST = 9/25 15:10 UTC → 방금 넘어간 자정
        expect(service.startOfKstDay(new Date('2026-09-25T15:10:00Z')).toISOString()).toBe('2026-09-25T15:00:00.000Z');
        // 9/25 23:50 KST = 9/25 14:50 UTC → 아직 전날
        expect(service.startOfKstDay(new Date('2026-09-25T14:50:00Z')).toISOString()).toBe('2026-09-24T15:00:00.000Z');
    });

    it('하루 3회를 넘기면 막는다', () => {
        expect(() => service.ensureWithinDailyQuota(2)).not.toThrow();
        expect(() => service.ensureWithinDailyQuota(3)).toThrow('하루 3회');
    });
});
