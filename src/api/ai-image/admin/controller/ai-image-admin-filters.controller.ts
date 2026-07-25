import { Body, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../../common/pipe/mongo-object-id.pipe';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../constants/ai-image-response-messages';
import { GetAllAiImageFiltersUseCase } from '../application/use-cases/get-all-ai-image-filters.use-case';
import { CreateAiImageFilterUseCase } from '../application/use-cases/create-ai-image-filter.use-case';
import { UpdateAiImageFilterUseCase } from '../application/use-cases/update-ai-image-filter.use-case';
import { DeleteAiImageFilterUseCase } from '../application/use-cases/delete-ai-image-filter.use-case';
import { AiImageAdminController } from '../decorator/ai-image-admin-controller.decorator';
import { AiImageFilterCreateRequestDto } from '../dto/request/ai-image-filter-create-request.dto';
import { AiImageFilterUpdateRequestDto } from '../dto/request/ai-image-filter-update-request.dto';
import { AiImageFilterPreviewRequestDto } from '../dto/request/ai-image-filter-preview-request.dto';
import type { AiImageAdminFilterResponseDto, AiImageFilterDeleteResponseDto } from '../dto/response/ai-image-admin-filter-response.dto';
import type { AiImageFilterPreviewResponseDto } from '../dto/response/ai-image-filter-preview-response.dto';
import { GenerateAiImageFilterPreviewUseCase } from '../application/use-cases/generate-ai-image-filter-preview.use-case';
import {
    ApiCreateAiImageFilterEndpoint,
    ApiDeleteAiImageFilterEndpoint,
    ApiGenerateAiImageFilterPreviewEndpoint,
    ApiGetAllAiImageFiltersEndpoint,
    ApiUpdateAiImageFilterEndpoint,
} from '../swagger';

/** AI 필터 CRUD (관리자) */
@AiImageAdminController()
export class AiImageAdminFiltersController {
    constructor(
        private readonly getAllAiImageFiltersUseCase: GetAllAiImageFiltersUseCase,
        private readonly createAiImageFilterUseCase: CreateAiImageFilterUseCase,
        private readonly updateAiImageFilterUseCase: UpdateAiImageFilterUseCase,
        private readonly deleteAiImageFilterUseCase: DeleteAiImageFilterUseCase,
        private readonly generateAiImageFilterPreviewUseCase: GenerateAiImageFilterPreviewUseCase,
    ) {}

    @Get('filters')
    @ApiGetAllAiImageFiltersEndpoint()
    async getFilters(): Promise<ApiResponseDto<AiImageAdminFilterResponseDto[]>> {
        const result = await this.getAllAiImageFiltersUseCase.execute();
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.filtersRetrieved);
    }

    @Post('filter')
    @ApiCreateAiImageFilterEndpoint()
    async createFilter(
        @Body() body: AiImageFilterCreateRequestDto,
    ): Promise<ApiResponseDto<AiImageAdminFilterResponseDto>> {
        const result = await this.createAiImageFilterUseCase.execute(body);
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.filterCreated);
    }

    @Patch('filter/:filterId')
    @ApiUpdateAiImageFilterEndpoint()
    async updateFilter(
        @Param('filterId', new MongoObjectIdPipe('AI 필터', '올바르지 않은 AI 필터 ID 형식입니다.')) filterId: string,
        @Body() body: AiImageFilterUpdateRequestDto,
    ): Promise<ApiResponseDto<AiImageAdminFilterResponseDto>> {
        const result = await this.updateAiImageFilterUseCase.execute(filterId, body);
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.filterUpdated);
    }

    @Delete('filter/:filterId')
    @ApiDeleteAiImageFilterEndpoint()
    async deleteFilter(
        @Param('filterId', new MongoObjectIdPipe('AI 필터', '올바르지 않은 AI 필터 ID 형식입니다.')) filterId: string,
    ): Promise<ApiResponseDto<AiImageFilterDeleteResponseDto>> {
        const result = await this.deleteAiImageFilterUseCase.execute(filterId);
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.filterDeleted);
    }

    @Post('filter/preview')
    @ApiGenerateAiImageFilterPreviewEndpoint()
    async previewFilter(
        @Body() body: AiImageFilterPreviewRequestDto,
    ): Promise<ApiResponseDto<AiImageFilterPreviewResponseDto>> {
        const result = await this.generateAiImageFilterPreviewUseCase.execute({
            prompt: body.prompt,
            negativePrompt: body.negativePrompt ?? '',
            inputObjectKey: body.inputObjectKey,
            model: body.model ?? '',
            outputSize: body.outputSize ?? '1024x1024',
            postProcessType: body.postProcessType ?? 'pixelate',
            pixelSize: body.pixelSize ?? 96,
            paletteSize: body.paletteSize ?? 48,
        });
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.filterPreviewGenerated);
    }
}
