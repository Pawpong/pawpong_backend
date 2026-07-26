import type { AiImageJobSnapshot } from '../types/ai-image-job-snapshot.type';

export const AI_IMAGE_JOB_READER_PORT = Symbol('AI_IMAGE_JOB_READER_PORT');

export interface AiImageJobReaderPort {
    findById(jobId: string): Promise<AiImageJobSnapshot | null>;

    /** 내 생성 목록 (최신순) */
    findByUserId(userId: string, limit: number): Promise<AiImageJobSnapshot[]>;

    /** 쿼터 산정 — 사용자·콘테스트별 생성 횟수 (실패 건은 제외) */
    countByUserAndContest(userId: string, contestId: string | null): Promise<number>;
}
