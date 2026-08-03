import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { AI_IMAGE_AGENT_GRPC_CLIENT } from '../constants/ai-image-agent-grpc.constant';
import type { AiImageAgentHealthPort } from '../application/ports/ai-image-agent-health.port';
import type { AiImageAgentHealthResult, AiImageAgentStatus } from '../application/types/ai-image-agent-health.type';

/** proto 서비스 시그니처 (grpc-js 가 런타임에 채워준다) */
interface AiAgentHealthGrpcService {
    healthCheck(request: Record<string, never>): unknown;
}

/** proto HealthCheckResponse 의 camelCase 매핑 */
interface HealthCheckGrpcResponse {
    status?: string;
    version?: string;
    inFlightJobs?: number | string;
    kafkaConnected?: boolean;
    openaiConfigured?: boolean;
}

/**
 * AI Agent 헬스체크 gRPC 클라이언트.
 *
 * 어드민이 미리보기를 누르기 전에 "지금 눌러도 되는지" 확인하는 용도라 즉답이어야 한다.
 * 미리보기(최대 120초)와 달리 짧은 타임아웃을 쓰고, 연결 실패를 예외로 올리지 않는다 —
 * 에이전트가 죽었다는 사실 자체가 어드민이 받아야 할 답이기 때문이다.
 */
@Injectable()
export class AiImageAgentHealthGrpcAdapter implements AiImageAgentHealthPort, OnModuleInit {
    /** 상태 확인은 즉답이어야 한다. 에이전트가 멈춰 있어도 어드민 화면이 매달리지 않게 짧게 끊는다 */
    private static readonly CALL_TIMEOUT_MS = 5_000;

    private grpcService: AiAgentHealthGrpcService;

    constructor(
        @Inject(AI_IMAGE_AGENT_GRPC_CLIENT) private readonly client: ClientGrpc,
        private readonly logger: CustomLoggerService,
    ) {}

    onModuleInit(): void {
        this.grpcService = this.client.getService<AiAgentHealthGrpcService>('AiAgentService');
    }

    async checkHealth(): Promise<AiImageAgentHealthResult> {
        try {
            const response = await firstValueFrom(
                (
                    this.grpcService.healthCheck({}) as import('rxjs').Observable<HealthCheckGrpcResponse>
                ).pipe(timeout(AiImageAgentHealthGrpcAdapter.CALL_TIMEOUT_MS)),
            );

            return {
                // 에이전트가 보고한 값을 그대로 신뢰하되, 알 수 없는 값은 DEGRADED 로 낮춘다
                status: this.normalizeStatus(response.status),
                isReachable: true,
                version: response.version || null,
                inFlightJobs: Number(response.inFlightJobs ?? 0),
                kafkaConnected: Boolean(response.kafkaConnected),
                openaiConfigured: Boolean(response.openaiConfigured),
                errorMessage: null,
            };
        } catch (error) {
            this.logger.logWarning('checkAiImageAgentHealth', 'AI Agent 헬스체크 실패 - UNREACHABLE 로 보고', null);
            return {
                status: 'UNREACHABLE',
                isReachable: false,
                version: null,
                inFlightJobs: 0,
                kafkaConnected: false,
                openaiConfigured: false,
                errorMessage: error instanceof Error ? error.message : String(error),
            };
        }
    }

    private normalizeStatus(status: string | undefined): AiImageAgentStatus {
        return status === 'SERVING' ? 'SERVING' : 'DEGRADED';
    }
}
