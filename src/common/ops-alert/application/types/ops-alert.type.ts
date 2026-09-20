import type { OpsPendingKind } from '../../../events/ops-pending.event';

/** 운영 대기 이벤트 적재 명령 */
export interface RecordOpsPendingCommand {
    kind: OpsPendingKind;
    referenceId: string;
    summary: string;
    details?: Array<{ name: string; value: string }>;
}

/** 알림 전송에 필요한 만큼만 담은 대기 이벤트 스냅샷 */
export interface OpsPendingEventSnapshot {
    eventId: string;
    kind: string;
    referenceId: string;
    summary: string;
    details: Array<{ name: string; value: string }>;
    adminPath: string;
    environment: string;
    remindCount: number;
    createdAt: Date;
}
