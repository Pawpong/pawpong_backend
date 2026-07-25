import { AiImageSharedModule } from './shared/ai-image-shared.module';
import { AiImageFiltersModule } from './filters/ai-image-filters.module';
import { AiImageGenerationModule } from './generation/ai-image-generation.module';
import { AiImageAdminModule } from './admin/ai-image-admin.module';

// AI 이미지 바운디드 컨텍스트 — 기능 슬라이스 조립만 담당한다.
// 생성 결과(파일키)는 기존 콘테스트 출품 API 가 그대로 소비하므로 contest 도메인은 수정하지 않는다.
export const AI_IMAGE_MODULE_IMPORTS = [
    AiImageSharedModule,
    AiImageFiltersModule,
    AiImageGenerationModule,
    AiImageAdminModule,
];

export const AI_IMAGE_MODULE_EXPORTS = [AiImageSharedModule];
