/** 어드민 필터 미리보기 명령 (내부 타입 — request DTO 를 그대로 넘기지 않는다) */
export interface AiImagePreviewCommand {
    prompt: string;
    negativePrompt: string;
    inputObjectKey: string;
    model: string;
    outputSize: string;
    postProcessType: 'none' | 'pixelate';
    pixelSize: number;
    paletteSize: number;
}

/** AI Agent 응답 */
export interface AiImagePreviewResult {
    isSuccess: boolean;
    /** 성공 시 결과 파일키 */
    outputObjectKey: string | null;
    /** 성공 시 조회용 CDN URL */
    outputImageUrl: string | null;
    latencyMs: number;
    errorCode: string | null;
    errorMessage: string | null;
}
