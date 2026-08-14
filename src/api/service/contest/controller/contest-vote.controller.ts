import { Delete, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../../common/pipe/mongo-object-id.pipe';
import { CancelContestVoteUseCase } from '../application/use-cases/cancel-contest-vote.use-case';
import { VoteContestEntryUseCase } from '../application/use-cases/vote-contest-entry.use-case';
import { ContestProtectedController } from '../decorator/contest-controller.decorator';
import { ApiCancelContestVoteEndpoint, ApiVoteContestEntryEndpoint } from '../swagger/index';

/**
 * 콘테스트 항목 투표/취소 (Figma 315:5985 투표하기 버튼).
 * POST   v2/contest/vote/:entryId — 투표
 * DELETE v2/contest/vote/:entryId — 투표 취소
 */
@ContestProtectedController()
export class ContestVoteController {
    constructor(
        private readonly voteContestEntryUseCase: VoteContestEntryUseCase,
        private readonly cancelContestVoteUseCase: CancelContestVoteUseCase,
    ) {}

    @Post('vote/:entryId')
    @HttpCode(HttpStatus.OK)
    @ApiVoteContestEntryEndpoint()
    async vote(
        @Param('entryId', new MongoObjectIdPipe('항목')) entryId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<unknown>> {
        const result = await this.voteContestEntryUseCase.execute(entryId, userId);
        return ApiResponseDto.success(result, '투표가 완료되었습니다.');
    }

    @Delete('vote/:entryId')
    @HttpCode(HttpStatus.OK)
    @ApiCancelContestVoteEndpoint()
    async cancelVote(
        @Param('entryId', new MongoObjectIdPipe('항목')) entryId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<unknown>> {
        const result = await this.cancelContestVoteUseCase.execute(entryId, userId);
        return ApiResponseDto.success(result, '투표가 취소되었습니다.');
    }
}
