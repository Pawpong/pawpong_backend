import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetPreviousRankingUseCase } from '../application/use-cases/get-previous-ranking.use-case';
import { ContestPublicController } from '../decorator/contest-controller.decorator';
import { ApiGetPreviousRankingEndpoint } from '../swagger';

/**
 * 저번 콘테스트 1~3위 (Figma 716:65272 저번주 랭킹 섹션).
 * GET v2/contest/previous-ranking
 */
@ContestPublicController()
export class ContestPreviousRankingController {
    constructor(private readonly getPreviousRankingUseCase: GetPreviousRankingUseCase) {}

    @Get('previous-ranking')
    @ApiGetPreviousRankingEndpoint()
    async getPreviousRanking(): Promise<ApiResponseDto<unknown>> {
        const result = await this.getPreviousRankingUseCase.execute();
        return ApiResponseDto.success(result, '저번 콘테스트 랭킹 조회 완료');
    }
}
