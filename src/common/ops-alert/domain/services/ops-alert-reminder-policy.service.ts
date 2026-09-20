import { Injectable } from '@nestjs/common';

/**
 * 미처리 리마인드 정책.
 *
 * 접수 후 관리자가 손대지 않으면 6시간 간격으로 최대 4번까지 다시 알린다.
 * 하루 안에 네 번 찌르고 멈추는 구성이라, 방이 시끄러워지지 않으면서도 하루를 통째로 놓치지 않는다.
 */
@Injectable()
export class OpsAlertReminderPolicyService {
    /** 리마인드 간격 (6시간) */
    private static readonly INTERVAL_MS = 6 * 60 * 60 * 1000;

    /** 리마인드 최대 횟수 */
    private static readonly MAX_REMIND_COUNT = 4;

    /** 첫 알림을 보낸 뒤 다음 리마인드 시각 */
    getFirstRemindAt(deliveredAt: Date): Date {
        return new Date(deliveredAt.getTime() + OpsAlertReminderPolicyService.INTERVAL_MS);
    }

    /**
     * 리마인드를 보낸 뒤 다음 시각.
     * 상한에 도달하면 undefined 를 돌려주고, 그 뒤로는 조용히 대기 목록에만 남는다.
     */
    getNextRemindAt(sentAt: Date, remindCount: number): Date | undefined {
        if (remindCount >= OpsAlertReminderPolicyService.MAX_REMIND_COUNT) {
            return undefined;
        }
        return new Date(sentAt.getTime() + OpsAlertReminderPolicyService.INTERVAL_MS);
    }

    /** 이번 리마인드가 몇 번째인지 표시하기 위한 상한 값 */
    getMaxRemindCount(): number {
        return OpsAlertReminderPolicyService.MAX_REMIND_COUNT;
    }

    /** 접수 후 경과 시간을 사람이 읽는 형태로 (리마인드 본문에서 방치 시간을 바로 보여준다) */
    describeElapsed(createdAt: Date, now: Date): string {
        const minutes = Math.max(0, Math.floor((now.getTime() - createdAt.getTime()) / 60_000));
        if (minutes < 60) return `${minutes}분`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}시간`;
        return `${Math.floor(hours / 24)}일 ${hours % 24}시간`;
    }
}
