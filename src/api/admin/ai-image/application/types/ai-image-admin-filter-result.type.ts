/** 어드민 필터 응답 계약 (프롬프트 포함 — 관리자 전용) */
export interface AiImageAdminFilterResult {
    filterId: string;
    name: string;
    description: string;
    thumbnailUrl?: string;
    thumbnailFileName: string | null;
    prompt: string;
    negativePrompt: string;
    model: string;
    outputSize: string;
    referenceImageObjectKeys: string[];
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}
