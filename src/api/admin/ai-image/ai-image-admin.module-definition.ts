import { join } from 'path';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AiImageSharedModule } from '../../service/ai-image/shared/ai-image-shared.module';
import { AiImageAdminFiltersController } from './controller/ai-image-admin-filters.controller';
import { GetAllAiImageFiltersUseCase } from './application/use-cases/get-all-ai-image-filters.use-case';
import { CreateAiImageFilterUseCase } from './application/use-cases/create-ai-image-filter.use-case';
import { UpdateAiImageFilterUseCase } from './application/use-cases/update-ai-image-filter.use-case';
import { DeleteAiImageFilterUseCase } from './application/use-cases/delete-ai-image-filter.use-case';
import { GenerateAiImageFilterPreviewUseCase } from './application/use-cases/generate-ai-image-filter-preview.use-case';
import { AiImageAdminFilterResultMapperService } from './domain/services/ai-image-admin-filter-result-mapper.service';
import { AiImageAdminFilterRepository } from './repository/ai-image-admin-filter.repository';
import { AiImageAdminFilterWriterAdapter } from './infrastructure/ai-image-admin-filter-writer.adapter';
import { AiImagePreviewGrpcAdapter } from './infrastructure/ai-image-preview-grpc.adapter';
import { AI_IMAGE_ADMIN_FILTER_WRITER_PORT } from './application/ports/ai-image-admin-filter-writer.port';
import { AI_IMAGE_PREVIEW_PORT } from './application/ports/ai-image-preview.port';
import { AI_IMAGE_AGENT_GRPC_CLIENT, AI_IMAGE_AGENT_GRPC_PACKAGE } from './constants/ai-image-agent-grpc.constant';

// AI 이미지 > 관리자 슬라이스 (필터 CRUD + AI Agent 미리보기)
// 필터 조회(READER)와 파일 URL 변환은 shared 에서 주입받고, 쓰기 Port 와 gRPC 경계만 직접 소유한다.
//
// gRPC 클라이언트를 admin 슬라이스에만 배선하는 이유:
// 사용자 생성 경로는 Kafka 만 쓰므로 AI Agent 가 꺼져 있어도 동작해야 한다.
// 여기에서만 의존시키면 에이전트 장애가 어드민 미리보기 하나로 격리된다.
const AI_IMAGE_AGENT_GRPC_CLIENT_MODULE = ClientsModule.registerAsync([
    {
        name: AI_IMAGE_AGENT_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            transport: Transport.GRPC as const,
            options: {
                url: configService.get<string>('AI_AGENT_GRPC_URL') || 'localhost:50051',
                package: AI_IMAGE_AGENT_GRPC_PACKAGE,
                // nest-cli 에 assets 설정이 없어 .proto 가 dist 로 복사되지 않는다.
                // cwd 기준으로 읽고, 컨테이너에는 Dockerfile 의 COPY proto 로 포함시킨다.
                protoPath: join(process.cwd(), 'proto/ai_agent.proto'),
            },
        }),
    },
]);

export const AI_IMAGE_ADMIN_MODULE_IMPORTS = [AiImageSharedModule, AI_IMAGE_AGENT_GRPC_CLIENT_MODULE];

export const AI_IMAGE_ADMIN_MODULE_CONTROLLERS = [AiImageAdminFiltersController];

const AI_IMAGE_ADMIN_USE_CASE_PROVIDERS = [
    GetAllAiImageFiltersUseCase,
    CreateAiImageFilterUseCase,
    UpdateAiImageFilterUseCase,
    DeleteAiImageFilterUseCase,
    GenerateAiImageFilterPreviewUseCase,
];

const AI_IMAGE_ADMIN_DOMAIN_PROVIDERS = [AiImageAdminFilterResultMapperService];

const AI_IMAGE_ADMIN_INFRASTRUCTURE_PROVIDERS = [
    AiImageAdminFilterRepository,
    AiImageAdminFilterWriterAdapter,
    AiImagePreviewGrpcAdapter,
];

const AI_IMAGE_ADMIN_PORT_BINDINGS = [
    { provide: AI_IMAGE_ADMIN_FILTER_WRITER_PORT, useExisting: AiImageAdminFilterWriterAdapter },
    { provide: AI_IMAGE_PREVIEW_PORT, useExisting: AiImagePreviewGrpcAdapter },
];

export const AI_IMAGE_ADMIN_MODULE_PROVIDERS = [
    ...AI_IMAGE_ADMIN_USE_CASE_PROVIDERS,
    ...AI_IMAGE_ADMIN_DOMAIN_PROVIDERS,
    ...AI_IMAGE_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...AI_IMAGE_ADMIN_PORT_BINDINGS,
];
