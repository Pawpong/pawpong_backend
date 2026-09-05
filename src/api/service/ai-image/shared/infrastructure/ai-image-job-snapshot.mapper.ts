import type { AiImageJobDocument } from '../../../../../schema/ai-image-job.schema';
import type { AiImageJobSnapshot } from '../application/types/ai-image-job-snapshot.type';

/** 생성 작업 도큐먼트 → 애플리케이션 스냅샷 (reader/writer 어댑터 공용) */
export function toAiImageJobSnapshot(job: AiImageJobDocument): AiImageJobSnapshot {
    return {
        jobId: String(job._id),
        userId: job.userId,
        userRole: job.userRole,
        contestId: job.contestId ? String(job.contestId) : null,
        filterId: String(job.filterId),
        inputObjectKey: job.inputObjectKey,
        outputObjectKey: job.outputObjectKey ?? null,
        status: job.status,
        promptSnapshot: job.promptSnapshot,
        negativePromptSnapshot: job.negativePromptSnapshot ?? '',
        modelSnapshot: job.modelSnapshot,
        outputSizeSnapshot: job.outputSizeSnapshot ?? '1024x1024',
        attempt: job.attempt ?? 1,
        errorCode: job.errorCode ?? null,
        completedAt: job.completedAt ?? null,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
    };
}
