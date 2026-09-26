import { Injectable } from '@nestjs/common';

/** KST 는 DST 가 없어 고정 오프셋으로 다룰 수 있다. */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 회차가 시작되는 날짜 (KST 기준) */
const PERIOD_START_DAYS = [1, 11, 21] as const;

export type CommunityHallOfFamePeriod = {
    /** 'YYYY-M-N' (N = 1|2|3) */
    periodKey: string;
    year: number;
    month: number;
    /** 1 | 2 | 3 */
    index: number;
    /** 회차 시작 시각 (KST 첫날 00:00 에 해당하는 UTC instant) */
    startDate: Date;
    /** 다음 회차 시작 시각. 게시글 조회 시 $lt 로 쓰는 배타적 상한. */
    endDate: Date;
};

/**
 * 명예의 전당 회차를 KST 기준으로 계산한다.
 *
 * 한 달을 3회차로 나눈다 — 1~10일 / 11~20일 / 21~말일.
 * 말일은 28·29·30·31 로 가변이므로 3회차의 끝은 '다음 달 1일 00:00' 으로 잡는다.
 *
 * 서버가 UTC 로 돌기 때문에 반드시 KST 로 환산해야 한다.
 * 그대로 UTC 로 계산하면 1일 00:00 KST(= 전날 15:00 UTC)가 이전 회차로 잡혀 하루씩 밀린다.
 */
@Injectable()
export class CommunityHallOfFamePeriodService {
    /** 주어진 시각이 속한 회차 */
    resolve(instant: Date): CommunityHallOfFamePeriod {
        const { year, month, day } = this.toKstParts(instant);
        const index = this.resolveIndex(day);
        return this.build(year, month, index);
    }

    /** 주어진 시각이 속한 회차의 직전 회차 */
    resolvePrevious(instant: Date): CommunityHallOfFamePeriod {
        const current = this.resolve(instant);

        if (current.index > 1) {
            return this.build(current.year, current.month, current.index - 1);
        }

        // 1회차의 직전은 전달 3회차
        const isJanuary = current.month === 1;
        return this.build(isJanuary ? current.year - 1 : current.year, isJanuary ? 12 : current.month - 1, 3);
    }

    /** 회차 식별자로부터 회차를 복원한다 (형식이 틀리면 null) */
    fromKey(periodKey: string): CommunityHallOfFamePeriod | null {
        const matched = /^(\d{4})-(\d{1,2})-([123])$/.exec(periodKey);
        if (!matched) return null;

        const month = Number(matched[2]);
        if (month < 1 || month > 12) return null;

        return this.build(Number(matched[1]), month, Number(matched[3]));
    }

    private build(year: number, month: number, index: number): CommunityHallOfFamePeriod {
        const startDay = PERIOD_START_DAYS[index - 1];
        const startDate = this.kstMidnightAsUtc(year, month, startDay);

        // 1·2회차는 같은 달 다음 구간의 첫날, 3회차는 다음 달 1일이 상한이 된다.
        const endDate =
            index < 3
                ? this.kstMidnightAsUtc(year, month, PERIOD_START_DAYS[index])
                : this.kstMidnightAsUtc(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 1);

        return { periodKey: `${year}-${month}-${index}`, year, month, index, startDate, endDate };
    }

    private resolveIndex(day: number): number {
        if (day <= 10) return 1;
        if (day <= 20) return 2;
        return 3;
    }

    /** UTC instant → KST 벽시계 연·월·일 */
    private toKstParts(instant: Date): { year: number; month: number; day: number } {
        const shifted = new Date(instant.getTime() + KST_OFFSET_MS);
        return {
            year: shifted.getUTCFullYear(),
            month: shifted.getUTCMonth() + 1,
            day: shifted.getUTCDate(),
        };
    }

    /** KST 벽시계 자정 → UTC instant */
    private kstMidnightAsUtc(year: number, month: number, day: number): Date {
        return new Date(Date.UTC(year, month - 1, day) - KST_OFFSET_MS);
    }
}
