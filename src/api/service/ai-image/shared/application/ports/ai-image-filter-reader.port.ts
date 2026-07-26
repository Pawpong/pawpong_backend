import type { AiImageFilterSnapshot } from '../types/ai-image-filter-snapshot.type';

export const AI_IMAGE_FILTER_READER_PORT = Symbol('AI_IMAGE_FILTER_READER_PORT');

export interface AiImageFilterReaderPort {
    /** 사용자 노출용 활성 필터 목록 (sortOrder 오름차순) */
    findActive(): Promise<AiImageFilterSnapshot[]>;

    /** 관리자용 전체 목록 (비활성 포함) */
    findAll(): Promise<AiImageFilterSnapshot[]>;

    /** 단건 조회. 없으면 null */
    findById(filterId: string): Promise<AiImageFilterSnapshot | null>;
}
