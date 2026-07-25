/**
 * AI 이미지 생성 작업 상태.
 *
 * PENDING → QUEUED → PROCESSING → SUCCEEDED | FAILED
 * SUCCEEDED / FAILED 는 종료 상태로, 이후 전이를 허용하지 않는다.
 */
export enum AiImageJobStatus {
    /** Job 도큐먼트 생성됨 (큐 발행 전) */
    PENDING = 'pending',
    /** Kafka 요청 토픽 발행 완료, AI Agent 처리 대기 */
    QUEUED = 'queued',
    /** AI Agent 가 처리 중 */
    PROCESSING = 'processing',
    /** 생성 성공 (outputObjectKey 존재) */
    SUCCEEDED = 'succeeded',
    /** 생성 실패 (errorCode 존재) */
    FAILED = 'failed',
}

/** 결과 메시지를 반영할 수 있는 진행 중 상태 (멱등 처리 기준) */
export const AI_IMAGE_JOB_IN_PROGRESS_STATUSES: AiImageJobStatus[] = [
    AiImageJobStatus.PENDING,
    AiImageJobStatus.QUEUED,
    AiImageJobStatus.PROCESSING,
];
