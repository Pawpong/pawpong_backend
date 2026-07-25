import type { AiImageJobStatus } from '../../../../../common/enum/ai-image-job-status.enum';

/** 생성 작업 도큐먼트를 애플리케이션 계층으로 옮긴 중간 모델 */
export interface AiImageJobSnapshot {
    jobId: string;
    userId: string;
    userRole: 'adopter' | 'breeder';
    contestId: string | null;
    filterId: string;
    inputObjectKey: string;
    outputObjectKey: string | null;
    status: AiImageJobStatus;
    promptSnapshot: string;
    negativePromptSnapshot: string;
    modelSnapshot: string;
    outputSizeSnapshot: string;
    attempt: number;
    errorCode: string | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
