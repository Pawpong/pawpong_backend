import { Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { FollowUserUseCase } from '../application/use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from '../application/use-cases/unfollow-user.use-case';
import { GetUserFollowersUseCase } from '../application/use-cases/get-user-followers.use-case';
import { GetUserFollowingsUseCase } from '../application/use-cases/get-user-followings.use-case';
import { RemoveMyFollowerUseCase } from '../application/use-cases/remove-my-follower.use-case';
import { PROFILE_RESPONSE_MESSAGES } from '../constants/profile-response-messages';
import { ProfileMeController, ProfilePublicController } from '../decorator/profile-protected-controller.decorator';
import { FollowListQueryDto } from '../dto/request/follow-list-query.dto';
import type { FollowResponseDto, UnfollowResponseDto } from '../dto/response/follow-response.dto';
import type { FollowUserCardResponseDto, RemoveFollowerResponseDto } from '../dto/response/follow-user-card.dto';
import {
    ApiFollowUserEndpoint,
    ApiGetUserFollowersEndpoint,
    ApiGetUserFollowingsEndpoint,
    ApiRemoveMyFollowerEndpoint,
    ApiUnfollowUserEndpoint,
} from '../swagger/index';

/**
 * 팔로우/언팔로우 + 내 팔로워 삭제 — JWT 필수, 입양자/브리더 모두 사용 가능 (Figma 678:46565).
 */
@ProfileMeController()
export class ProfileFollowController {
    constructor(
        private readonly followUserUseCase: FollowUserUseCase,
        private readonly unfollowUserUseCase: UnfollowUserUseCase,
        private readonly removeMyFollowerUseCase: RemoveMyFollowerUseCase,
    ) {}

    @Post('users/:userId/follow')
    @HttpCode(HttpStatus.OK)
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

    // 친구 목록 모달의 팔로워 "삭제" — 상대가 나를 팔로우한 관계를 끊는다.
    // JSDoc 블록으로 쓰면 swagger 플러그인이 ApiOperation 을 덮어써 summary 가 사라진다.
    @Delete('me/followers/:userId')
    @ApiRemoveMyFollowerEndpoint()
    async removeFollower(
        @Param('userId') followerId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<RemoveFollowerResponseDto>> {
        const { wasFollowing } = await this.removeMyFollowerUseCase.execute(userId, followerId);
        return ApiResponseDto.success({ followerId, removed: wasFollowing }, PROFILE_RESPONSE_MESSAGES.followerRemoved);
    }
}

/**
 * 친구 목록 모달(팔로워/팔로잉 탭) — 공개 프로필과 동일하게 비로그인 조회 가능.
 * 로그인 시 각 항목의 isFollowing/isFollowedBy 가 채워져 "팔로잉 / 맞팔로잉" 버튼 상태를 만든다.
 */
@ProfilePublicController()
export class ProfileFollowListController {
    constructor(
        private readonly getUserFollowersUseCase: GetUserFollowersUseCase,
        private readonly getUserFollowingsUseCase: GetUserFollowingsUseCase,
    ) {}

    @Get('users/:userId/followers')
    @ApiGetUserFollowersEndpoint()
    async getFollowers(
        @Param('userId') userId: string,
        @Query() query: FollowListQueryDto,
        @CurrentUser('userId') viewerId?: string,
    ): Promise<ApiResponseDto<PaginationResponseDto<FollowUserCardResponseDto>>> {
        const result = await this.getUserFollowersUseCase.execute(userId, query.page, query.pageSize, viewerId);
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            PROFILE_RESPONSE_MESSAGES.followersRetrieved,
        );
    }

    @Get('users/:userId/followings')
    @ApiGetUserFollowingsEndpoint()
    async getFollowings(
        @Param('userId') userId: string,
        @Query() query: FollowListQueryDto,
        @CurrentUser('userId') viewerId?: string,
    ): Promise<ApiResponseDto<PaginationResponseDto<FollowUserCardResponseDto>>> {
        const result = await this.getUserFollowingsUseCase.execute(userId, query.page, query.pageSize, viewerId);
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            PROFILE_RESPONSE_MESSAGES.followingsRetrieved,
        );
    }
}
