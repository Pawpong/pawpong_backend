/** 필터 도큐먼트를 애플리케이션 계층으로 옮긴 중간 모델 */
export interface AiImageFilterSnapshot {
    filterId: string;
    name: string;
    description: string;
    thumbnailFileName: string | null;
    prompt: string;
    negativePrompt: string;
    model: string;
    outputSize: string;
    referenceImageObjectKeys: string[];
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
