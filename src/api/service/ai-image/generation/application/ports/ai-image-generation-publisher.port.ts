import type { AiImageGenerationRequestedEvent } from '../types/ai-image-generation-command.type';

export const AI_IMAGE_GENERATION_PUBLISHER_PORT = Symbol('AI_IMAGE_GENERATION_PUBLISHER_PORT');

export interface AiImageGenerationPublisherPort {
    /**
     * 생성 요청을 큐에 발행한다.
     * 큐가 사용 불가하면 예외를 던진다 — 조용히 실패하면 작업이 영원히 대기 상태로 남는다.
     */
    publishGenerationRequested(event: AiImageGenerationRequestedEvent): Promise<void>;
}
