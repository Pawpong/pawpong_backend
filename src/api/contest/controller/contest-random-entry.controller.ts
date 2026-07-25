import { Get } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetRandomContestEntryUseCase } from '../application/use-cases/get-random-contest-entry.use-case';
import { ContestProtectedController } from '../decorator/contest-controller.decorator';
import { ApiGetRandomContestEntryEndpoint } from '../swagger';

/**
 * 랜덤 투표 후보 조회 (Figma 315:5985 투표하러가기).
 * GET v2/contest/random-entry
 */
@ContestProtectedController()
export class ContestRandomEntryController {
    constructor(private readonly getRandomContestEntryUseCase: GetRandomContestEntryUseCase) {}

    @Get('random-entry')
    @ApiGetRandomContestEntryEndpoint()
    async getRandomEntry(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<unknown>> {
        const result = await this.getRandomContestEntryUseCase.execute(userId);
        return ApiResponseDto.success(result, '랜덤 투표 후보 조회 완료');
    }
}
