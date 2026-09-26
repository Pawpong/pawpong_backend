import { Get, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';

import { GetCommunityHallOfFameHistoryUseCase } from '../application/use-cases/get-community-hall-of-fame-history.use-case';
import { GetCurrentCommunityHallOfFameUseCase } from '../application/use-cases/get-current-community-hall-of-fame.use-case';
import { COMMUNITY_RESPONSE_MESSAGES } from '../constants/community-response-messages';
import { CommunityPublicController } from '../decorator/community-public-controller.decorator';
import { CommunityHallOfFameQueryDto } from '../dto/request/community-hall-of-fame-query.dto';
import { CommunityHallOfFameResponseDto } from '../dto/response/community-hall-of-fame.dto';
import { ApiGetCommunityHallOfFameHistoryEndpoint, ApiGetCurrentCommunityHallOfFameEndpoint } from '../swagger/index';

@CommunityPublicController()
export class CommunityHallOfFameController {
    constructor(
        private readonly getCurrentUseCase: GetCurrentCommunityHallOfFameUseCase,
        private readonly getHistoryUseCase: GetCommunityHallOfFameHistoryUseCase,
    ) {}

    // 구체 경로가 먼저 선언돼야 'hall-of-fame' 목록 라우트와 겹치지 않는다.
    @Get('hall-of-fame/current')
    @ApiGetCurrentCommunityHallOfFameEndpoint()
    async current(): Promise<ApiResponseDto<CommunityHallOfFameResponseDto>> {
        const result = await this.getCurrentUseCase.execute();
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.hallOfFameCurrentRetrieved);
    }

    @Get('hall-of-fame')
    @ApiGetCommunityHallOfFameHistoryEndpoint()
    async history(
        @Query() query: CommunityHallOfFameQueryDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<CommunityHallOfFameResponseDto>>> {
        const result = await this.getHistoryUseCase.execute({ page: query.page, pageSize: query.pageSize });
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            COMMUNITY_RESPONSE_MESSAGES.hallOfFameHistoryRetrieved,
        );
    }
}
