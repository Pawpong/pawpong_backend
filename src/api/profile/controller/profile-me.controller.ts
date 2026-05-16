import { BadRequestException, Body, Get, Patch, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';

import { GetMyFavoriteBreedersUseCase } from '../application/use-cases/get-my-favorite-breeders.use-case';
import { GetMyProfileUseCase } from '../application/use-cases/get-my-profile.use-case';
import { UpdateMyProfileUseCase } from '../application/use-cases/update-my-profile.use-case';
import { PROFILE_RESPONSE_MESSAGES } from '../constants/profile-response-messages';
import {
    ProfileFavoritesController,
    ProfileMeController as ProfileMeControllerDecorator,
} from '../decorator/profile-protected-controller.decorator';
import { FavoriteBreedersQueryDto } from '../dto/request/favorite-breeders-query.dto';
import { UpdateMyProfileRequestDto } from '../dto/request/update-my-profile-request.dto';
import { FavoriteBreederCardResponseDto } from '../dto/response/favorite-breeder-card.dto';
import { MyProfileResponseDto } from '../dto/response/my-profile-response.dto';
import { ApiGetMyFavoriteBreedersEndpoint, ApiGetMyProfileEndpoint, ApiUpdateMyProfileEndpoint } from '../swagger';

/**
 * GET / PATCH /v2/profile/me (인증 필수, role 무관)
 */
@ProfileMeControllerDecorator()
export class ProfileMeController {
    constructor(
        private readonly getMyProfileUseCase: GetMyProfileUseCase,
        private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
    ) {}

    @Get('me')
    @ApiGetMyProfileEndpoint()
    async getMe(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
    ): Promise<ApiResponseDto<MyProfileResponseDto>> {
        if (role !== 'adopter' && role !== 'breeder') {
            throw new BadRequestException('지원하지 않는 사용자 역할입니다.');
        }
        const result = await this.getMyProfileUseCase.execute(userId, role);
        return ApiResponseDto.success(result, PROFILE_RESPONSE_MESSAGES.myRetrieved);
    }

    @Patch('me')
    @ApiUpdateMyProfileEndpoint()
    async updateMe(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() body: UpdateMyProfileRequestDto,
    ): Promise<ApiResponseDto<MyProfileResponseDto>> {
        if (role !== 'adopter' && role !== 'breeder') {
            throw new BadRequestException('지원하지 않는 사용자 역할입니다.');
        }
        const result = await this.updateMyProfileUseCase.execute(userId, role, {
            bio: body.bio,
            location: body.location,
        });
        return ApiResponseDto.success(result, PROFILE_RESPONSE_MESSAGES.myUpdated);
    }
}

/**
 * GET /v2/profile/me/favorite-breeders (입양자 전용 — StrictRolesGuard)
 *
 * 별도 컨트롤러로 분리: 본 라우트만 'adopter' role 강제가 필요해서
 * /me 와 같은 컨트롤러에 두면 role 가드를 메서드 단위로 흩뿌리게 된다.
 */
@ProfileFavoritesController()
export class ProfileFavoriteBreedersController {
    constructor(private readonly getMyFavoriteBreedersUseCase: GetMyFavoriteBreedersUseCase) {}

    @Get('me/favorite-breeders')
    @ApiGetMyFavoriteBreedersEndpoint()
    async getFavorites(
        @CurrentUser('userId') userId: string,
        @Query() query: FavoriteBreedersQueryDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<FavoriteBreederCardResponseDto>>> {
        const result = await this.getMyFavoriteBreedersUseCase.execute(userId, query.page, query.pageSize);
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            PROFILE_RESPONSE_MESSAGES.favoriteBreedersRetrieved,
        );
    }
}
