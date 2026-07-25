import { AiImageSharedModule } from '../shared/ai-image-shared.module';
import { AiImageAdminFiltersController } from './controller/ai-image-admin-filters.controller';
import { GetAllAiImageFiltersUseCase } from './application/use-cases/get-all-ai-image-filters.use-case';
import { CreateAiImageFilterUseCase } from './application/use-cases/create-ai-image-filter.use-case';
import { UpdateAiImageFilterUseCase } from './application/use-cases/update-ai-image-filter.use-case';
import { DeleteAiImageFilterUseCase } from './application/use-cases/delete-ai-image-filter.use-case';
import { AiImageAdminFilterResultMapperService } from './domain/services/ai-image-admin-filter-result-mapper.service';
import { AiImageAdminFilterRepository } from './repository/ai-image-admin-filter.repository';
import { AiImageAdminFilterWriterAdapter } from './infrastructure/ai-image-admin-filter-writer.adapter';
import { AI_IMAGE_ADMIN_FILTER_WRITER_PORT } from './application/ports/ai-image-admin-filter-writer.port';

// AI 이미지 > 관리자 슬라이스 (필터 CRUD)
// 필터 조회(READER)와 파일 URL 변환은 shared 에서 주입받고, 쓰기 Port 만 직접 소유한다.
export const AI_IMAGE_ADMIN_MODULE_IMPORTS = [AiImageSharedModule];

export const AI_IMAGE_ADMIN_MODULE_CONTROLLERS = [AiImageAdminFiltersController];

const AI_IMAGE_ADMIN_USE_CASE_PROVIDERS = [
    GetAllAiImageFiltersUseCase,
    CreateAiImageFilterUseCase,
    UpdateAiImageFilterUseCase,
    DeleteAiImageFilterUseCase,
];

const AI_IMAGE_ADMIN_DOMAIN_PROVIDERS = [AiImageAdminFilterResultMapperService];

const AI_IMAGE_ADMIN_INFRASTRUCTURE_PROVIDERS = [AiImageAdminFilterRepository, AiImageAdminFilterWriterAdapter];

const AI_IMAGE_ADMIN_PORT_BINDINGS = [
    { provide: AI_IMAGE_ADMIN_FILTER_WRITER_PORT, useExisting: AiImageAdminFilterWriterAdapter },
];

export const AI_IMAGE_ADMIN_MODULE_PROVIDERS = [
    ...AI_IMAGE_ADMIN_USE_CASE_PROVIDERS,
    ...AI_IMAGE_ADMIN_DOMAIN_PROVIDERS,
    ...AI_IMAGE_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...AI_IMAGE_ADMIN_PORT_BINDINGS,
];
