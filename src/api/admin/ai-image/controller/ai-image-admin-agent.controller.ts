import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../../service/ai-image/constants/ai-image-response-messages';
import { GetAiImageAgentHealthUseCase } from '../application/use-cases/get-ai-image-agent-health.use-case';
import { AiImageAdminController } from '../decorator/ai-image-admin-controller.decorator';
import type { AiImageAgentHealthResponseDto } from '../dto/response/ai-image-agent-health-response.dto';
import { ApiGetAiImageAgentHealthEndpoint } from '../swagger/index';

/** AI Agent 가동 상태 (관리자) */
@AiImageAdminController()
export class AiImageAdminAgentController {
    constructor(private readonly getAiImageAgentHealthUseCase: GetAiImageAgentHealthUseCase) {}

    @Get('agent/health')
    @ApiGetAiImageAgentHealthEndpoint()
    async getAgentHealth(): Promise<ApiResponseDto<AiImageAgentHealthResponseDto>> {
        const result = await this.getAiImageAgentHealthUseCase.execute();
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.agentHealthRetrieved);
    }
}
