import { AiImageSharedModule } from '../shared/ai-image-shared.module';
import { AiImageUploadUrlController } from './controller/ai-image-upload-url.controller';
import { AiImageGenerationController } from './controller/ai-image-generation.controller';
import { AiImageGenerationKafkaConsumer } from './ai-image-generation-kafka.consumer';
import { CreateAiImageUploadUrlUseCase } from './application/use-cases/create-ai-image-upload-url.use-case';
import { RequestAiImageGenerationUseCase } from './application/use-cases/request-ai-image-generation.use-case';
import { GetAiImageGenerationUseCase } from './application/use-cases/get-ai-image-generation.use-case';
import { GetMyAiImageGenerationsUseCase } from './application/use-cases/get-my-ai-image-generations.use-case';
import { ApplyAiImageGenerationResultUseCase } from './application/use-cases/apply-ai-image-generation-result.use-case';
import { AiImageQuotaService } from './domain/services/ai-image-quota.service';
import { AiImageGenerationResultMapperService } from './domain/services/ai-image-generation-result-mapper.service';
import { AiImageJobWriterAdapter } from './infrastructure/ai-image-job-writer.adapter';
import { AiImageGenerationKafkaPublisherAdapter } from './infrastructure/ai-image-generation-kafka-publisher.adapter';
import { AI_IMAGE_JOB_WRITER_PORT } from './application/ports/ai-image-job-writer.port';
import { AI_IMAGE_GENERATION_PUBLISHER_PORT } from './application/ports/ai-image-generation-publisher.port';

// AI 이미지 > 생성 슬라이스
// 업로드 URL 발급 → 생성 요청(큐 발행) → 상태 폴링.
// KafkaService 는 @Global KafkaModule 이 제공하므로 별도 import 가 필요 없다.
export const AI_IMAGE_GENERATION_MODULE_IMPORTS = [AiImageSharedModule];

export const AI_IMAGE_GENERATION_MODULE_CONTROLLERS = [
    AiImageUploadUrlController,
    AiImageGenerationController,
    // Kafka 결과 수신 (@EventPattern 은 컨트롤러로 등록해야 마이크로서비스가 인식한다)
    AiImageGenerationKafkaConsumer,
];

const AI_IMAGE_GENERATION_USE_CASE_PROVIDERS = [
    CreateAiImageUploadUrlUseCase,
    RequestAiImageGenerationUseCase,
    GetAiImageGenerationUseCase,
    GetMyAiImageGenerationsUseCase,
    ApplyAiImageGenerationResultUseCase,
];

// AiImageObjectKeyService 는 어드민 애셋 업로드와 공유하므로 shared 에서 주입받는다
const AI_IMAGE_GENERATION_DOMAIN_PROVIDERS = [
    AiImageQuotaService,
    AiImageGenerationResultMapperService,
];

const AI_IMAGE_GENERATION_INFRASTRUCTURE_PROVIDERS = [AiImageJobWriterAdapter, AiImageGenerationKafkaPublisherAdapter];

const AI_IMAGE_GENERATION_PORT_BINDINGS = [
    { provide: AI_IMAGE_JOB_WRITER_PORT, useExisting: AiImageJobWriterAdapter },
    { provide: AI_IMAGE_GENERATION_PUBLISHER_PORT, useExisting: AiImageGenerationKafkaPublisherAdapter },
];

export const AI_IMAGE_GENERATION_MODULE_PROVIDERS = [
    ...AI_IMAGE_GENERATION_USE_CASE_PROVIDERS,
    ...AI_IMAGE_GENERATION_DOMAIN_PROVIDERS,
    ...AI_IMAGE_GENERATION_INFRASTRUCTURE_PROVIDERS,
    ...AI_IMAGE_GENERATION_PORT_BINDINGS,
];
