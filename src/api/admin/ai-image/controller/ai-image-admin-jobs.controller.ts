import { Get, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import type { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../../service/ai-image/constants/ai-image-response-messages';
import { GetAiImageJobsUseCase } from '../application/use-cases/get-ai-image-jobs.use-case';
import { AiImageAdminController } from '../decorator/ai-image-admin-controller.decorator';
import { AiImageAdminJobListRequestDto } from '../dto/request/ai-image-admin-job-list-request.dto';
import type { AiImageAdminJobResponseDto } from '../dto/response/ai-image-admin-job-response.dto';
import { ApiGetAiImageJobsEndpoint } from '../swagger/index';

/** AI 생성 작업 모니터링 (관리자) */
@AiImageAdminController()
export class AiImageAdminJobsController {
    constructor(private readonly getAiImageJobsUseCase: GetAiImageJobsUseCase) {}

    @Get('jobs')
    @ApiGetAiImageJobsEndpoint()
    async getJobs(
        @Query() query: AiImageAdminJobListRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<AiImageAdminJobResponseDto>>> {
        const result = await this.getAiImageJobsUseCase.execute({
            status: query.status,
            userId: query.userId,
            filterId: query.filterId,
            page: query.page,
            limit: query.limit,
        });
        return ApiResponseDto.success(result, AI_IMAGE_RESPONSE_MESSAGES.jobsRetrieved);
    }
}
