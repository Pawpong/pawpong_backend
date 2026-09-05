import type { AiImageJobStatus } from '../../../../../../common/enum/ai-image-job-status.enum';

/** 생성 작업 응답 계약 */
export interface AiImageGenerationResult {
    jobId: string;
    status: AiImageJobStatus;
    filterId: string;
    /** 성공 시에만 채워지는 결과 이미지 URL */
    resultImageUrl?: string;
    /** 콘테스트 출품에 넘길 파일키 (성공 시) */
    resultObjectKey: string | null;
    errorCode: string | null;
    createdAt: string;
    completedAt: string | null;
}
