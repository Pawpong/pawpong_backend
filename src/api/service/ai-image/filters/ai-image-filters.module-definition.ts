import { AiImageSharedModule } from '../shared/ai-image-shared.module';
import { AiImageFiltersController } from './controller/ai-image-filters.controller';
import { GetActiveAiImageFiltersUseCase } from './application/use-cases/get-active-ai-image-filters.use-case';
import { AiImageFilterResultMapperService } from './domain/services/ai-image-filter-result-mapper.service';

// AI 이미지 > 사용자 필터 목록 슬라이스 (읽기 전용)
export const AI_IMAGE_FILTERS_MODULE_IMPORTS = [AiImageSharedModule];

export const AI_IMAGE_FILTERS_MODULE_CONTROLLERS = [AiImageFiltersController];

export const AI_IMAGE_FILTERS_MODULE_PROVIDERS = [GetActiveAiImageFiltersUseCase, AiImageFilterResultMapperService];
