/** 필터 생성 입력 (어드민) */
export interface AiImageFilterCreateCommand {
    name: string;
    description?: string;
    thumbnailFileName?: string | null;
    prompt: string;
    negativePrompt?: string;
    model: string;
    outputSize?: string;
    referenceImageObjectKeys?: string[];
    isActive?: boolean;
    sortOrder?: number;
}

/** 필터 수정 입력 (부분 수정) */
export type AiImageFilterUpdateCommand = Partial<AiImageFilterCreateCommand>;
