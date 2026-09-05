import type { AiImageJobStatus } from '../../../../../common/enum/ai-image-job-status.enum';

/** 어드민 생성 작업 조회 조건 */
export interface AiImageAdminJobListCommand {
    status?: AiImageJobStatus;
    userId?: string;
    filterId?: string;
    page: number;
    limit: number;
}

/**
 * 어드민에게 노출하는 생성 작업 1건.
 *
 * 사용자 응답과 달리 프롬프트·모델 스냅샷을 포함한다 —
 * 실패 원인을 추적하려면 그 작업이 실제로 어떤 프롬프트로 돌았는지 봐야 하고,
 * 필터를 수정한 뒤에는 필터 정의만 봐서는 알 수 없기 때문이다.
 */
export interface AiImageAdminJobResult {
    jobId: string;
    userId: string;
    userRole: 'adopter' | 'breeder';
    contestId: string | null;
    filterId: string;
    status: AiImageJobStatus;
    inputObjectKey: string;
    inputImageUrl: string | null;
    outputObjectKey: string | null;
    outputImageUrl: string | null;
    promptSnapshot: string;
    negativePromptSnapshot: string;
    modelSnapshot: string;
    outputSizeSnapshot: string;
    attempt: number;
    errorCode: string | null;
    createdAt: string;
    completedAt: string | null;
}

/** 페이지 단위 조회 결과 */
export interface AiImageAdminJobPage {
    items: AiImageAdminJobResult[];
    totalCount: number;
}
