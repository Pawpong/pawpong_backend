import { Inject, Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { AI_IMAGE_ASSET_URL_PORT } from '../../../service/ai-image/shared/application/ports/ai-image-asset-url.port';
import type { AiImageAssetUrlPort } from '../../../service/ai-image/shared/application/ports/ai-image-asset-url.port';
import { AI_IMAGE_AGENT_GRPC_CLIENT } from '../constants/ai-image-agent-grpc.constant';
import type { AiImagePreviewPort } from '../application/ports/ai-image-preview.port';
import type { AiImagePreviewCommand, AiImagePreviewResult } from '../application/types/ai-image-preview.type';

/** proto 서비스 시그니처 (grpc-js 가 런타임에 채워준다) */
interface AiAgentGrpcService {
    generateFilterPreview(request: Record<string, unknown>): {
        subscribe: unknown;
    };
}

/** proto GenerateFilterPreviewResponse 의 camelCase 매핑 */
interface GenerateFilterPreviewGrpcResponse {
    success?: boolean;
    outputObjectKey?: string;
    latencyMs?: number | string;
    errorCode?: string;
    errorMessage?: string;
}

/**
 * AI Agent gRPC 클라이언트.
 *
 * 어드민이 저장 버튼을 누르기 전 결과를 확인하는 용도라 동기 호출이 맞다.
 * 다만 OpenAI 왕복이 끼어 있어 최악의 경우 수십 초가 걸리므로,
 * 어드민 요청이 무한정 매달리지 않도록 자체 타임아웃을 건다.
 */
@Injectable()
export class AiImagePreviewGrpcAdapter implements AiImagePreviewPort, OnModuleInit {
    /** OpenAI 이미지 변환 자체가 수십 초라 넉넉히 잡되, 무한 대기는 막는다 */
    private static readonly CALL_TIMEOUT_MS = 120_000;

    private grpcService: AiAgentGrpcService;

    constructor(
        @Inject(AI_IMAGE_AGENT_GRPC_CLIENT) private readonly client: ClientGrpc,
        @Inject(AI_IMAGE_ASSET_URL_PORT) private readonly assetUrlPort: AiImageAssetUrlPort,
        private readonly logger: CustomLoggerService,
    ) {}

    onModuleInit(): void {
        this.grpcService = this.client.getService<AiAgentGrpcService>('AiAgentService');
    }

    async generatePreview(command: AiImagePreviewCommand): Promise<AiImagePreviewResult> {
        try {
            const response = await firstValueFrom(
                (
                    this.grpcService.generateFilterPreview({
                        prompt: command.prompt,
                        negativePrompt: command.negativePrompt,
                        inputObjectKey: command.inputObjectKey,
                        model: command.model,
                        outputSize: command.outputSize,
                        postProcess: {
                            type: command.postProcessType,
                            pixelSize: command.pixelSize,
                            paletteSize: command.paletteSize,
                        },
                    }) as unknown as import('rxjs').Observable<GenerateFilterPreviewGrpcResponse>
                ).pipe(timeout(AiImagePreviewGrpcAdapter.CALL_TIMEOUT_MS)),
            );

            const outputObjectKey = response.outputObjectKey || null;
            return {
                isSuccess: Boolean(response.success),
                outputObjectKey,
                outputImageUrl: this.assetUrlPort.toUrl(outputObjectKey) ?? null,
                // proto int64 는 문자열로 올 수 있어 정규화한다
                latencyMs: Number(response.latencyMs ?? 0),
                errorCode: response.errorCode || null,
                errorMessage: response.errorMessage || null,
            };
        } catch (error) {
            // 에이전트 미기동·네트워크 단절은 어드민에게 원인이 보이도록 503 으로 돌려준다
            this.logger.logError('generateAiImagePreview', 'AI Agent gRPC 호출 실패', error);
            throw new ServiceUnavailableException('AI Agent에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
    }
}
