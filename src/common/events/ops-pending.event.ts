/**
 * 운영자 처리 대기 이벤트.
 *
 * 신청·심사·신고처럼 관리자가 손대야 끝나는 일이 생기거나 끝났을 때 발행한다.
 * 알림 채널(디스코드)과 리마인드 정책은 구독 측(OpsAlertModule)이 전부 책임지므로,
 * 발행하는 도메인은 "무엇이 접수됐는지"만 알면 된다.
 */

/** 처리 대기 종류. 디스코드 방과 어드민 딥링크를 고르는 기준이다 */
export const OPS_PENDING_KIND = {
    /** 입양/상담 신청 접수 */
    ADOPTION_APPLICATION: 'adoption_application',
    /** 브리더 인증 심사 대기 */
    BREEDER_VERIFICATION: 'breeder_verification',
    /** 브리더 신고 접수 */
    BREEDER_REPORT: 'breeder_report',
    /** 후기 신고 접수 */
    REVIEW_REPORT: 'review_report',
    /** 커뮤니티 신고 접수 */
    COMMUNITY_REPORT: 'community_report',
    /** 문의 접수 */
    INQUIRY: 'inquiry',
} as const;

export type OpsPendingKind = (typeof OPS_PENDING_KIND)[keyof typeof OPS_PENDING_KIND];

/** 처리 대기가 생겼을 때 */
export const OPS_PENDING_CREATED_EVENT = 'ops.pending.created';

export interface OpsPendingCreatedEvent {
    kind: OpsPendingKind;
    /** 원본 도큐먼트 id. 처리 완료 이벤트와 짝을 맞추는 키다 */
    referenceId: string;
    /** 한 줄 요약 (개인정보는 발행 측에서 빼고 보낸다) */
    summary: string;
    /** 알림에 나열할 항목. 이름/값 모두 짧게 유지한다 */
    details?: Array<{ name: string; value: string }>;
}

/** 관리자가 처리해 대기가 끝났을 때 (리마인드 중단) */
export const OPS_PENDING_RESOLVED_EVENT = 'ops.pending.resolved';

export interface OpsPendingResolvedEvent {
    kind: OpsPendingKind;
    referenceId: string;
    /** 처리 방식 메모 (예: 승인, 거절, 처리완료) */
    resolution?: string;
}
