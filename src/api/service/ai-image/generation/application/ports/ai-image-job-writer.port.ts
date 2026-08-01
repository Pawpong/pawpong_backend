import type { AiImageJobSnapshot } from '../../../shared/application/types/ai-image-job-snapshot.type';
import type { AiImageJobCreateCommand } from '../types/ai-image-generation-command.type';

export const AI_IMAGE_JOB_WRITER_PORT = Symbol('AI_IMAGE_JOB_WRITER_PORT');

export interface AiImageJobWriterPort {
    /** PENDING 상태로 작업 생성 */
    createPending(data: AiImageJobCreateCommand): Promise<AiImageJobSnapshot>;

    /** 큐 발행 성공 → QUEUED. 진행 중 상태일 때만 전이된다(멱등) */
    markQueued(jobId: string): Promise<AiImageJobSnapshot | null>;

    /** 성공 종료. 진행 중 상태일 때만 전이된다(중복 결과 메시지 무시) */
    markSucceeded(jobId: string, outputObjectKey: string): Promise<AiImageJobSnapshot | null>;

    /** 실패 종료. 진행 중 상태일 때만 전이된다 */
    markFailed(jobId: string, errorCode: string): Promise<AiImageJobSnapshot | null>;
}
