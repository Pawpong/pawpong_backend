import { AiImageSharedModule } from '../shared/ai-image-shared.module';
import { AiImageUploadUrlController } from './controller/ai-image-upload-url.controller';
import { CreateAiImageUploadUrlUseCase } from './application/use-cases/create-ai-image-upload-url.use-case';
import { AiImageObjectKeyService } from './domain/services/ai-image-object-key.service';

// AI 이미지 > 생성 슬라이스
// 현재: 원본 업로드 URL 발급. 이후 단계에서 Job 생성·Kafka 발행·상태 폴링이 추가된다.
export const AI_IMAGE_GENERATION_MODULE_IMPORTS = [AiImageSharedModule];

export const AI_IMAGE_GENERATION_MODULE_CONTROLLERS = [AiImageUploadUrlController];

export const AI_IMAGE_GENERATION_MODULE_PROVIDERS = [CreateAiImageUploadUrlUseCase, AiImageObjectKeyService];
