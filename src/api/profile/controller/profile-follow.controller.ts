import { Delete, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { FollowUserUseCase } from '../application/use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from '../application/use-cases/unfollow-user.use-case';
import { PROFILE_RESPONSE_MESSAGES } from '../constants/profile-response-messages';
import { ProfileMeController } from '../decorator/profile-protected-controller.decorator';
import type { FollowResponseDto, UnfollowResponseDto } from '../dto/response/follow-response.dto';
import { ApiFollowUserEndpoint, ApiUnfollowUserEndpoint } from '../swagger';

/**
 * 팔로우/언팔로우 — JWT 필수, 입양자/브리더 모두 사용 가능 (Figma 678:46565).
 */
@ProfileMeController()
export class ProfileFollowController {
    constructor(
        private readonly followUserUseCase: FollowUserUseCase,
        private readonly unfollowUserUseCase: UnfollowUserUseCase,
    ) {}

    @Post('users/:userId/follow')
    @ApiFollowUserEndpoint()
    async follow(
        @Param('userId') followeeId: string,
        @CurrentUser('userId') followerId: string,
    ): Promise<ApiResponseDto<FollowResponseDto>> {
        const { alreadyFollowing } = await this.followUserUseCase.execute(followerId, followeeId);
        return ApiResponseDto.success({ followeeId, followed: !alreadyFollowing }, PROFILE_RESPONSE_MESSAGES.followed);
    }

    @Delete('users/:userId/follow')
    @ApiUnfollowUserEndpoint()
    async unfollow(
        @Param('userId') followeeId: string,
        @CurrentUser('userId') followerId: string,
    ): Promise<ApiResponseDto<UnfollowResponseDto>> {
        const { wasFollowing } = await this.unfollowUserUseCase.execute(followerId, followeeId);
        return ApiResponseDto.success({ followeeId, unfollowed: wasFollowing }, PROFILE_RESPONSE_MESSAGES.unfollowed);
    }
}
