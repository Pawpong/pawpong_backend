import { Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import { VoteContestEntryUseCase } from '../application/use-cases/vote-contest-entry.use-case';
import { ContestProtectedController } from '../decorator/contest-controller.decorator';
import { ApiVoteContestEntryEndpoint } from '../swagger';

/**
 * 콘테스트 항목 투표 (Figma 315:5985 투표하기 버튼).
 * POST v2/contest/vote/:entryId
 */
@ContestProtectedController()
export class ContestVoteController {
    constructor(private readonly voteContestEntryUseCase: VoteContestEntryUseCase) {}

    @Post('vote/:entryId')
    @ApiVoteContestEntryEndpoint()
    async vote(
        @Param('entryId', new MongoObjectIdPipe('항목')) entryId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<unknown>> {
        const result = await this.voteContestEntryUseCase.execute(entryId, userId);
        return ApiResponseDto.success(result, '투표가 완료되었습니다.');
    }
}
