import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../constants/ai-image-response-messages';
import { GetActiveAiImageFiltersUseCase } from '../application/use-cases/get-active-ai-image-filters.use-case';
import { AiImageFiltersController as AiImageFiltersControllerDecorator } from '../decorator/ai-image-filters-controller.decorator';
import type { AiImageFilterResponseDto } from '../dto/response/ai-image-filter-response.dto';
import { ApiGetActiveAiImageFiltersEndpoint } from '../swagger';

/** 사용자에게 노출되는 AI 필터 목록 */
@AiImageFiltersControllerDecorator()
export class AiImageFiltersController {
    constructor(private readonly getActiveAiImageFiltersUseCase: GetActiveAiImageFiltersUseCase) {}

    @Get('filters')
    @ApiGetActiveAiImageFiltersEndpoint()
    async getFilters(): Promise<ApiResponseDto<AiImageFilterResponseDto[]>> {
        const result = await this.getActiveAiImageFiltersUseCase.execute();
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.filtersRetrieved);
    }
}
