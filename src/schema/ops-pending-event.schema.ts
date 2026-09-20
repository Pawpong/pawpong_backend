import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

/**
 * 운영자 처리 대기 이벤트 (디스코드 알림 outbox + 미처리 리마인드)
 *
 * 신청/심사/신고처럼 관리자가 손대야 끝나는 일을 한 컬렉션에 모은다.
 * - 접수되면 종류별 디스코드 방으로 한 번 알린다 (어드민 화면 딥링크 포함)
 * - 관리자가 처리하기 전까지 정해진 주기로 리마인드를 보낸다
 * - 처리되면 resolvedAt 이 찍히고 리마인드가 멈춘다
 *
 * 재시작이나 웹훅 장애에도 접수가 유실되지 않도록 DB 를 큐로 쓴다.
 */
@Schema({ collection: 'ops_pending_events', timestamps: true })
export class OpsPendingEventRecord {
    /** 알림 본문에 노출되는 접수번호 (재전송 식별자) */
    @Prop({ required: true, unique: true }) eventId: string;

    /** 이벤트 종류. 디스코드 방과 어드민 딥링크를 고르는 기준이다 */
    @Prop({ required: true }) kind: string;

    /**
     * 원본 도큐먼트 id (신청 id, 인증 id, 신고 id).
     * 관리자가 처리했을 때 같은 값으로 이 레코드를 찾아 리마인드를 멈춘다.
     */
    @Prop({ required: true }) referenceId: string;

    /** 알림 제목 아래 한 줄 요약 */
    @Prop({ default: '' }) summary: string;

    /** 알림 embed 에 그대로 나열할 항목 (개인정보는 발행 측에서 이미 걸러 보낸다) */
    @Prop({ type: [{ name: String, value: String }], default: [], _id: false })
    details: Array<{ name: string; value: string }>;

    /** 어드민 프론트 경로. ADMIN_URL 과 합쳐 딥링크가 된다 */
    @Prop({ required: true }) adminPath: string;

    /** 이 이벤트가 발생한 환경 (production / development) */
    @Prop({ required: true, index: true }) environment: string;

    // === 최초 전송 (outbox) ===
    @Prop({ default: 'pending', enum: ['pending', 'delivered'] }) deliveryStatus: string;
    @Prop({ default: 0 }) attempts: number;
    @Prop({ default: () => new Date() }) nextAttemptAt: Date;
    @Prop() leaseToken?: string;
    @Prop() deliveredAt?: Date;

    // === 미처리 리마인드 ===
    /** 다음 리마인드 예정 시각. 최초 전송 성공 시점에 정해진다 */
    @Prop() nextRemindAt?: Date;
    /** 지금까지 보낸 리마인드 횟수 (상한에 도달하면 더 보내지 않는다) */
    @Prop({ default: 0 }) remindCount: number;

    // === 처리 완료 ===
    /**
     * 처리 완료 여부.
     * resolvedAt 의 존재 여부로 판단하지 않는 이유는 MongoDB 부분 인덱스가 `$exists: false` 를
     * 지원하지 않기 때문이다. 아래 유니크 인덱스가 "열려 있는 건"을 가려내려면 동등 비교가 필요하다.
     */
    @Prop({ default: false }) isResolved: boolean;

    /** 관리자가 처리한 시각 */
    @Prop() resolvedAt?: Date;
    /** 처리 방식 메모 (승인/거절/처리완료 등) */
    @Prop({ default: '' }) resolution: string;

    /**
     * 재동기화가 이 건의 원본 상태를 마지막으로 확인한 시각.
     * 오래 확인되지 않은 것부터 보게 해서, 건수가 많아도 모든 건이 돌아가며 검사된다.
     */
    @Prop() lastCheckedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export type OpsPendingEventDocument = HydratedDocument<OpsPendingEventRecord>;
export const OpsPendingEventSchema = SchemaFactory.createForClass(OpsPendingEventRecord);

// 최초 전송 대기 조회
OpsPendingEventSchema.index({ deliveryStatus: 1, environment: 1, nextAttemptAt: 1 });
// 미처리 리마인드 조회 (처리 안 됐고, 예정 시각이 지난 것)
OpsPendingEventSchema.index({ environment: 1, isResolved: 1, nextRemindAt: 1 });
// 관리자 처리 시 원본 id 로 찾기 + 같은 원본의 열린 접수는 환경별로 하나만 존재한다는 보장.
// 인스턴스가 여러 대여도(이벤트 + 재동기화 동시 실행 포함) 같은 건이 두 번 등록되지 않게 DB 가 막는다.
//
// environment 가 키에 들어가야 한다: 로컬과 dev 서버가 같은 데이터베이스를 쓰므로,
// 환경을 빼면 로컬이 만든 레코드가 dev 서버의 적재를 막아 그 환경에서는 알림이 영영 나가지 않는다.
OpsPendingEventSchema.index(
    { environment: 1, kind: 1, referenceId: 1 },
    { unique: true, partialFilterExpression: { isResolved: false } },
);
// 관리자 처리 시 원본 id 로 찾기 (환경 구분 없이 조회할 때)
OpsPendingEventSchema.index({ kind: 1, referenceId: 1 });
// 재동기화가 오래 확인되지 않은 건부터 집도록
OpsPendingEventSchema.index({ environment: 1, isResolved: 1, lastCheckedAt: 1 });
