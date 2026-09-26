import { CommunityHallOfFamePeriodService } from '../../../domain/services/community-hall-of-fame-period.service';

/** KST 벽시계 시각을 UTC instant 로 만든다 (테스트 가독성용) */
const kst = (iso: string) => new Date(`${iso}+09:00`);

describe('명예의 전당 회차 계산 (KST)', () => {
    const service = new CommunityHallOfFamePeriodService();

    describe('회차 구간', () => {
        it.each([
            ['2026-09-01T00:00:00', '2026-9-1'],
            ['2026-09-10T23:59:59', '2026-9-1'],
            ['2026-09-11T00:00:00', '2026-9-2'],
            ['2026-09-20T23:59:59', '2026-9-2'],
            ['2026-09-21T00:00:00', '2026-9-3'],
            ['2026-09-30T23:59:59', '2026-9-3'],
        ])('%s 는 %s 회차', (at, expected) => {
            expect(service.resolve(kst(at)).periodKey).toBe(expected);
        });
    });

    describe('KST 경계', () => {
        // UTC 로 계산하면 이 시각이 전날(8/31)로 잡혀 회차가 하루 밀린다.
        it('9월 1일 00:00 KST(= 8월 31일 15:00 UTC)는 9월 1회차다', () => {
            const period = service.resolve(new Date('2026-08-31T15:00:00Z'));

            expect(period.periodKey).toBe('2026-9-1');
            expect(period.startDate.toISOString()).toBe('2026-08-31T15:00:00.000Z');
        });

        it('8월 31일 23:59 KST 는 아직 8월 3회차다', () => {
            expect(service.resolve(new Date('2026-08-31T14:59:59Z')).periodKey).toBe('2026-8-3');
        });

        it('회차 경계는 startDate 이상 endDate 미만으로 맞물린다', () => {
            const second = service.resolve(kst('2026-09-15T12:00:00'));
            const third = service.resolve(kst('2026-09-25T12:00:00'));

            expect(second.endDate.getTime()).toBe(third.startDate.getTime());
        });
    });

    describe('말일 가변 처리', () => {
        it.each([
            ['2026-02-21T00:00:00', '2026-03-01T00:00:00', '28일 2월'],
            ['2024-02-21T00:00:00', '2024-03-01T00:00:00', '29일 2월(윤년)'],
            ['2026-04-21T00:00:00', '2026-05-01T00:00:00', '30일 4월'],
            ['2026-01-21T00:00:00', '2026-02-01T00:00:00', '31일 1월'],
        ])('%s 3회차의 끝은 %s (%s)', (thirdPeriodStart, nextMonthStart) => {
            const period = service.resolve(kst(thirdPeriodStart));

            expect(period.index).toBe(3);
            expect(period.endDate.getTime()).toBe(kst(nextMonthStart).getTime());
        });

        it('12월 3회차의 끝은 다음 해 1월 1일이다', () => {
            const period = service.resolve(kst('2026-12-25T00:00:00'));

            expect(period.periodKey).toBe('2026-12-3');
            expect(period.endDate.getTime()).toBe(kst('2027-01-01T00:00:00').getTime());
        });
    });

    describe('직전 회차', () => {
        it.each([
            ['2026-09-25T00:00:00', '2026-9-2'],
            ['2026-09-15T00:00:00', '2026-9-1'],
            ['2026-09-05T00:00:00', '2026-8-3'],
        ])('%s 의 직전은 %s', (at, expected) => {
            expect(service.resolvePrevious(kst(at)).periodKey).toBe(expected);
        });

        it('1월 1회차의 직전은 전년 12월 3회차다', () => {
            expect(service.resolvePrevious(kst('2026-01-05T00:00:00')).periodKey).toBe('2025-12-3');
        });
    });

    describe('fromKey', () => {
        it('식별자로 회차를 복원한다', () => {
            const period = service.fromKey('2026-9-2');

            expect(period?.startDate.getTime()).toBe(kst('2026-09-11T00:00:00').getTime());
            expect(period?.endDate.getTime()).toBe(kst('2026-09-21T00:00:00').getTime());
        });

        it.each(['2026-9-4', '2026-13-1', 'bad', '2026-9'])('잘못된 식별자 %s 는 null', (key) => {
            expect(service.fromKey(key)).toBeNull();
        });
    });
});
