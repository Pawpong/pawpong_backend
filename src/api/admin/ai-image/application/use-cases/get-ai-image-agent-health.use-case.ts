import { Inject, Injectable } from '@nestjs/common';

import { AI_IMAGE_AGENT_HEALTH_PORT } from '../ports/ai-image-agent-health.port';
import type { AiImageAgentHealthPort } from '../ports/ai-image-agent-health.port';
import type { AiImageAgentHealthResult } from '../types/ai-image-agent-health.type';

/**
 * AI Agent 가동 상태 조회.
 *
 * 미리보기는 OpenAI 왕복 때문에 최대 120초가 걸린다. 에이전트가 죽어 있는 줄 모르고
 * 눌렀다가 기다리는 일이 없도록, 어드민 화면이 먼저 상태를 확인할 수 있게 한다.
 */
@Injectable()
export class GetAiImageAgentHealthUseCase {
    constructor(
        @Inject(AI_IMAGE_AGENT_HEALTH_PORT)
        private readonly agentHealthPort: AiImageAgentHealthPort,
    ) {}

    async execute(): Promise<AiImageAgentHealthResult> {
        return this.agentHealthPort.checkHealth();
    }
}
