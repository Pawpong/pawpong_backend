import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../../../common/storage/storage.module';
import { AiImageFilter, AiImageFilterSchema } from '../../../../schema/ai-image-filter.schema';
import { AiImageJob, AiImageJobSchema } from '../../../../schema/ai-image-job.schema';

import { AiImageFilterRepository } from './repository/ai-image-filter.repository';
import { AiImageJobRepository } from './repository/ai-image-job.repository';
import { AiImageJobReaderAdapter } from './infrastructure/ai-image-job-reader.adapter';
import { AI_IMAGE_JOB_READER_PORT } from './application/ports/ai-image-job-reader.port';
import { AiImageFilterReaderAdapter } from './infrastructure/ai-image-filter-reader.adapter';
import { AiImageAssetUrlStorageAdapter } from './infrastructure/ai-image-asset-url-storage.adapter';
import { AI_IMAGE_FILTER_READER_PORT } from './application/ports/ai-image-filter-reader.port';
import { AI_IMAGE_ASSET_URL_PORT } from './application/ports/ai-image-asset-url.port';
import { AiImageFileStorageAdapter } from './infrastructure/ai-image-file-storage.adapter';
import { AI_IMAGE_FILE_STORAGE_PORT } from './application/ports/ai-image-file-storage.port';
import { AiImageObjectKeyService } from './domain/services/ai-image-object-key.service';

// AI 이미지 컨텍스트 공통 기반.
// 필터 조회(READER)와 파일키 → URL 변환은 filters/generation/admin 슬라이스가 모두 사용한다.
const AI_IMAGE_SHARED_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: AiImageFilter.name, schema: AiImageFilterSchema },
    { name: AiImageJob.name, schema: AiImageJobSchema },
]);

export const AI_IMAGE_SHARED_MODULE_IMPORTS = [AI_IMAGE_SHARED_SCHEMA_IMPORTS, StorageModule];

// S3 키 규칙은 사용자 생성(generation)과 어드민 애셋 업로드(admin)가 함께 쓴다
const AI_IMAGE_SHARED_DOMAIN_PROVIDERS = [AiImageObjectKeyService];

const AI_IMAGE_SHARED_INFRASTRUCTURE_PROVIDERS = [
    AiImageFilterRepository,
    AiImageFilterReaderAdapter,
    AiImageAssetUrlStorageAdapter,
    AiImageFileStorageAdapter,
    AiImageJobRepository,
    AiImageJobReaderAdapter,
];

const AI_IMAGE_SHARED_PORT_BINDINGS = [
    { provide: AI_IMAGE_FILTER_READER_PORT, useExisting: AiImageFilterReaderAdapter },
    { provide: AI_IMAGE_ASSET_URL_PORT, useExisting: AiImageAssetUrlStorageAdapter },
    { provide: AI_IMAGE_FILE_STORAGE_PORT, useExisting: AiImageFileStorageAdapter },
    { provide: AI_IMAGE_JOB_READER_PORT, useExisting: AiImageJobReaderAdapter },
];

export const AI_IMAGE_SHARED_MODULE_PROVIDERS = [
    ...AI_IMAGE_SHARED_DOMAIN_PROVIDERS,
    ...AI_IMAGE_SHARED_INFRASTRUCTURE_PROVIDERS,
    ...AI_IMAGE_SHARED_PORT_BINDINGS,
];

export const AI_IMAGE_SHARED_MODULE_EXPORTS = [
    AI_IMAGE_FILTER_READER_PORT,
    AI_IMAGE_ASSET_URL_PORT,
    AI_IMAGE_FILE_STORAGE_PORT,
    AiImageFilterRepository,
    AiImageJobRepository,
    AI_IMAGE_JOB_READER_PORT,
    AiImageObjectKeyService,
    // 슬라이스 레포지토리가 AiImageFilter/AiImageJob 모델을 주입받을 수 있도록 재노출
    MongooseModule,
];
