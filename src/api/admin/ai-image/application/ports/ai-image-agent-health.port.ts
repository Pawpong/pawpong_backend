import type { AiImageAgentHealthResult } from '../types/ai-image-agent-health.type';

export const AI_IMAGE_AGENT_HEALTH_PORT = Symbol('AI_IMAGE_AGENT_HEALTH_PORT');

/**
 * AI Agent 생존 확인 경계.
 *
 * 미리보기(AiImagePreviewPort)와 같은 gRPC 채널을 쓰지만 실패 의미가 정반대다.
 * 미리보기는 연결 실패를 503 으로 올리고, 헬스체크는 연결 실패 자체가 답이므로
 * 예외를 던지지 않고 UNREACHABLE 상태로 돌려준다.
 */
export interface AiImageAgentHealthPort {
    checkHealth(): Promise<AiImageAgentHealthResult>;
}
