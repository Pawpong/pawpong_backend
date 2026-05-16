import { Get } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetMyContestEntryUseCase } from '../application/use-cases/get-my-contest-entry.use-case';
import { ContestProtectedController } from '../decorator/contest-controller.decorator';
import { ApiGetMyContestEntryEndpoint } from '../swagger';

/**
 * 나의 참여 항목 (Figma 716:65272 나의 참여 보기).
 * GET v2/contest/me/entry
 */
@ContestProtectedController()
export class ContestMeController {
    constructor(private readonly getMyContestEntryUseCase: GetMyContestEntryUseCase) {}

    @Get('me/entry')
    @ApiGetMyContestEntryEndpoint()
    async getMyEntry(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<unknown>> {
        const result = await this.getMyContestEntryUseCase.execute(userId);
        return ApiResponseDto.success(result, '나의 참여 항목 조회 완료');
    }
}
