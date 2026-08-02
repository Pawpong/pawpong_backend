import { Body, Get, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../../../common/pipe/mongo-object-id.pipe';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../constants/ai-image-response-messages';
import { RequestAiImageGenerationUseCase } from '../application/use-cases/request-ai-image-generation.use-case';
import { GetAiImageGenerationUseCase } from '../application/use-cases/get-ai-image-generation.use-case';
import { GetMyAiImageGenerationsUseCase } from '../application/use-cases/get-my-ai-image-generations.use-case';
import { AiImageGenerationController as AiImageGenerationControllerDecorator } from '../decorator/ai-image-generation-controller.decorator';
import { AiImageGenerationRequestDto } from '../dto/request/ai-image-generation-request.dto';
import type { AiImageGenerationResponseDto } from '../dto/response/ai-image-generation-response.dto';
import {
    ApiGetAiImageGenerationEndpoint,
    ApiGetMyAiImageGenerationsEndpoint,
    ApiRequestAiImageGenerationEndpoint,
} from '../swagger/index';

/** AI 이미지 생성 요청 및 상태 조회 */
@AiImageGenerationControllerDecorator()
export class AiImageGenerationController {
    constructor(
        private readonly requestAiImageGenerationUseCase: RequestAiImageGenerationUseCase,
        private readonly getAiImageGenerationUseCase: GetAiImageGenerationUseCase,
        private readonly getMyAiImageGenerationsUseCase: GetMyAiImageGenerationsUseCase,
    ) {}

    @Post('generation')
    @ApiRequestAiImageGenerationEndpoint()
    async requestGeneration(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() body: AiImageGenerationRequestDto,
    ): Promise<ApiResponseDto<AiImageGenerationResponseDto>> {
        const userRole = role === 'breeder' ? 'breeder' : 'adopter';
        const result = await this.requestAiImageGenerationUseCase.execute({
            userId,
            userRole,
            filterId: body.filterId,
            inputObjectKey: body.inputObjectKey,
            contestId: body.contestId,
        });
        return ApiResponseDto.success(
            {
                jobId: result.jobId,
                status: result.status,
                filterId: result.filterId,
                resultObjectKey: result.outputObjectKey,
                errorCode: result.errorCode,
                createdAt: result.createdAt.toISOString(),
                completedAt: result.completedAt ? result.completedAt.toISOString() : null,
            },
            AI_IMAGE_RESPONSE_MESSAGES.generationRequested,
        );
    }

    @Get('generations')
    @ApiGetMyAiImageGenerationsEndpoint()
    async getMyGenerations(
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<AiImageGenerationResponseDto[]>> {
        const result = await this.getMyAiImageGenerationsUseCase.execute(userId);
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.generationsRetrieved);
    }

    @Get('generation/:jobId')
    @ApiGetAiImageGenerationEndpoint()
    async getGeneration(
        @Param('jobId', new MongoObjectIdPipe('AI 생성 요청', '올바르지 않은 AI 생성 요청 ID 형식입니다.'))
        jobId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<AiImageGenerationResponseDto>> {
        const result = await this.getAiImageGenerationUseCase.execute(jobId, userId);
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.generationRetrieved);
    }
}
