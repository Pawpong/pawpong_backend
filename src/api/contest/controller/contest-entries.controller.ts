import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetContestEntriesUseCase } from '../application/use-cases/get-contest-entries.use-case';
import { ContestPublicController } from '../decorator/contest-controller.decorator';
import { ApiGetContestEntriesEndpoint } from '../swagger';

/**
 * 투표 항목 목록 (Figma 315:5985 투표하기 그리드).
 * GET v2/contest/entries?page=1&limit=9
 */
@ContestPublicController()
export class ContestEntriesController {
    constructor(private readonly getContestEntriesUseCase: GetContestEntriesUseCase) {}

    @Get('entries')
    @ApiGetContestEntriesEndpoint()
    async getEntries(
        @Query('page') page = 1,
        @Query('limit') limit = 9,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<unknown>> {
        const result = await this.getContestEntriesUseCase.execute({
            page: Number(page),
            limit: Number(limit),
            userId,
        });
        return ApiResponseDto.success(result, '콘테스트 항목 조회 완료');
    }
}
