import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SUPPORT_AGENT_CLIENT, SUPPORT_AGENT_PORT } from './application/ports/support-agent.port';
import { AnswerSupportInquiryUseCase } from './application/use-cases/answer-support-inquiry.use-case';
import { SupportAgentGrpcAdapter } from './infrastructure/support-agent-grpc.adapter';
import { SupportRateLimitGuard } from './decorator/support-rate-limit.guard';

export const SUPPORT_GRPC_IMPORT = ClientsModule.registerAsync([
    {
        name: SUPPORT_AGENT_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
            transport: Transport.GRPC as const,
            options: {
                url: config.get<string>('AI_AGENT_GRPC_URL') || 'localhost:50051',
                package: 'pawpong.aiagent.v1',
                protoPath: join(process.cwd(), 'proto/ai_agent.proto'),
            },
        }),
    },
]);
export const SUPPORT_PROVIDERS = [
    AnswerSupportInquiryUseCase,
    SupportAgentGrpcAdapter,
    SupportRateLimitGuard,
    { provide: SUPPORT_AGENT_PORT, useExisting: SupportAgentGrpcAdapter },
];
