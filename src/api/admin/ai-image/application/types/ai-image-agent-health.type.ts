/**
 * AI Agent 가동 상태.
 * - SERVING: Kafka 연결 + OpenAI 키 설정 모두 정상 (사용자 생성·미리보기 모두 가능)
 * - DEGRADED: 프로세스는 살아 있으나 Kafka 또는 OpenAI 키가 빠짐 (생성 요청이 즉시 실패로 회신됨)
 * - UNREACHABLE: gRPC 로 에이전트에 닿지 못함 (컨테이너 미기동·네트워크 단절)
 */
export type AiImageAgentStatus = 'SERVING' | 'DEGRADED' | 'UNREACHABLE';

/** 어드민에게 노출하는 AI Agent 상태 */
export interface AiImageAgentHealthResult {
    status: AiImageAgentStatus;
    /** gRPC 응답 자체를 받았는지 (false 면 나머지 필드는 의미 없음) */
    isReachable: boolean;
    version: string | null;
    /** 에이전트가 현재 처리 중인 생성 건수 */
    inFlightJobs: number;
    kafkaConnected: boolean;
    /** OPENAI_API_KEY 설정 여부. 키 값 자체는 절대 노출하지 않는다 */
    openaiConfigured: boolean;
    /** 연결 실패 사유 (정상일 때 null) */
    errorMessage: string | null;
}
