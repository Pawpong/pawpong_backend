/** 생성 작업 생성 입력 (필터 스냅샷 포함) */
export interface AiImageJobCreateCommand {
    userId: string;
    userRole: 'adopter' | 'breeder';
    contestId: string | null;
    filterId: string;
    inputObjectKey: string;
    promptSnapshot: string;
    negativePromptSnapshot: string;
    modelSnapshot: string;
    outputSizeSnapshot: string;
}

/** Kafka 요청 토픽 페이로드 (Python AI Agent 계약) */
export interface AiImageGenerationRequestedEvent {
    /** KafkaService.emit 이 파티션 키로 사용 — Job 단위 순서 보장 */
    id: string;
    jobId: string;
    userId: string;
    inputObjectKey: string;
    outputObjectKey: string;
    prompt: string;
    negativePrompt: string;
    model: string;
    outputSize: string;
    requestedAt: string;
}

/** Kafka 결과 토픽 페이로드 (Python AI Agent → NestJS) */
export interface AiImageGenerationResultEvent {
    /** 파티션 키 (= jobId) */
    id: string;
    jobId: string;
    status: 'succeeded' | 'failed';
    /** 성공 시 결과 파일키 */
    outputObjectKey?: string | null;
    /** 실패 시 사유 코드 */
    errorCode?: string | null;
    completedAt: string;
}
