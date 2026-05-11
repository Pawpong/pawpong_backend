import { BadRequestException, Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';

import { CreateCommunityPostUseCase } from './application/use-cases/create-community-post.use-case';
import { DeleteCommunityPostUseCase } from './application/use-cases/delete-community-post.use-case';
import { UpdateCommunityPostUseCase } from './application/use-cases/update-community-post.use-case';
import { COMMUNITY_RESPONSE_MESSAGES } from './constants/community-response-messages';
import { CommunityProtectedController } from './decorator/community-protected-controller.decorator';
import { CreateCommunityPostRequestDto } from './dto/request/community-post-create-request.dto';
import { UpdateCommunityPostRequestDto } from './dto/request/community-post-update-request.dto';
import { CommunityPostDeleteResponseDto } from './dto/response/community-post-delete-response.dto';
import { CommunityPostDetailResponseDto } from './dto/response/community-post-detail.dto';
import {
    ApiCreateCommunityPostEndpoint,
    ApiDeleteCommunityPostEndpoint,
    ApiUpdateCommunityPostEndpoint,
} from './swagger';

@CommunityProtectedController()
export class CommunityPostWriteController {
    constructor(
        private readonly createUseCase: CreateCommunityPostUseCase,
        private readonly updateUseCase: UpdateCommunityPostUseCase,
        private readonly deleteUseCase: DeleteCommunityPostUseCase,
    ) {}

    @Post('posts')
    @ApiCreateCommunityPostEndpoint()
    async create(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() body: CreateCommunityPostRequestDto,
    ): Promise<ApiResponseDto<CommunityPostDetailResponseDto>> {
        const normalizedRole = this.normalizeAuthorRole(role);
        const result = await this.createUseCase.execute(userId, normalizedRole, body);
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.created);
    }

    @Patch('posts/:postId')
    @ApiUpdateCommunityPostEndpoint()
    async update(
        @CurrentUser('userId') userId: string,
        @Param('postId') postId: string,
        @Body() body: UpdateCommunityPostRequestDto,
    ): Promise<ApiResponseDto<CommunityPostDetailResponseDto>> {
        const result = await this.updateUseCase.execute(userId, postId, body);
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.updated);
    }

    @Delete('posts/:postId')
    @ApiDeleteCommunityPostEndpoint()
    async delete(
        @CurrentUser('userId') userId: string,
        @Param('postId') postId: string,
    ): Promise<ApiResponseDto<CommunityPostDeleteResponseDto>> {
        const result = await this.deleteUseCase.execute(userId, postId);
        return ApiResponseDto.success(result, COMMUNITY_RESPONSE_MESSAGES.deleted);
    }

    /**
     * JWT role 을 작성자 모델로 정규화. admin/unknown 은 작성 거부.
     */
    private normalizeAuthorRole(role: string | undefined): 'adopter' | 'breeder' {
        if (role === 'adopter' || role === 'breeder') return role;
        throw new BadRequestException('지원하지 않는 사용자 역할은 게시글을 작성할 수 없습니다.');
    }
}
