import { Get } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetCurrentContestUseCase } from '../application/use-cases/get-current-contest.use-case';
import { ContestPublicController } from '../decorator/contest-controller.decorator';
import { ApiGetCurrentContestEndpoint } from '../swagger';

/**
 * 현재 콘테스트 + 실시간 1~3위 랭킹 (Figma 716:65272, 315:5985).
 * GET v2/contest/current
 */
@ContestPublicController()
export class ContestCurrentController {
    constructor(private readonly getCurrentContestUseCase: GetCurrentContestUseCase) {}

    @Get('current')
    @ApiGetCurrentContestEndpoint()
    async getCurrent(@CurrentUser('userId') userId?: string): Promise<ApiResponseDto<unknown>> {
        const result = await this.getCurrentContestUseCase.execute(userId);
        return ApiResponseDto.success(result, '현재 콘테스트 조회 완료');
    }
}
