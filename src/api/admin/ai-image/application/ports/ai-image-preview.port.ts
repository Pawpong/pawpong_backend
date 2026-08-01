import type {
    AiImagePreviewCommand,
    AiImagePreviewResult,
} from '../types/ai-image-preview.type';

export const AI_IMAGE_PREVIEW_PORT = Symbol('AI_IMAGE_PREVIEW_PORT');

/**
 * AI Agent 동기 호출 경계.
 *
 * 사용자 생성은 Kafka 로만 처리한다. 이 Port 는 어드민이 프롬프트를 저장 전에
 * 즉시 확인하는 짧은 호출 전용이다.
 */
export interface AiImagePreviewPort {
    generatePreview(command: AiImagePreviewCommand): Promise<AiImagePreviewResult>;
}
