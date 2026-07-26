/**
 * 사용자 노출용 필터 카드.
 * 프롬프트·모델 등 운영 정보는 절대 포함하지 않는다.
 */
export interface AiImageFilterResult {
    filterId: string;
    name: string;
    description: string;
    thumbnailUrl?: string;
}
