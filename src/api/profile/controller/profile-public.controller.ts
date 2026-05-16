import { Get, Param } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';

import { GetAdopterProfileUseCase } from '../application/use-cases/get-adopter-profile.use-case';
import { GetBreederProfileUseCase } from '../application/use-cases/get-breeder-profile.use-case';
import { PROFILE_RESPONSE_MESSAGES } from '../constants/profile-response-messages';
import { ProfilePublicController as ProfilePublicControllerDecorator } from '../decorator/profile-protected-controller.decorator';
import { AdopterPublicProfileResponseDto } from '../dto/response/adopter-profile-response.dto';
import { BreederPublicProfileResponseDto } from '../dto/response/breeder-profile-response.dto';
import { ApiGetAdopterProfileEndpoint, ApiGetBreederProfileEndpoint } from '../swagger';

/**
 * GET /v2/profile/users/:userId (유저홈), /v2/profile/breeders/:breederId (브리더홈)
 *
 * OptionalJwtAuth: 비로그인 접근 가능, 로그인 시 isFollowing/isFavorited 채움.
 */
@ProfilePublicControllerDecorator()
export class ProfilePublicController {
    constructor(
        private readonly getAdopterProfileUseCase: GetAdopterProfileUseCase,
        private readonly getBreederProfileUseCase: GetBreederProfileUseCase,
    ) {}

    @Get('users/:userId')
    @ApiGetAdopterProfileEndpoint()
    async getAdopter(
        @Param('userId') userId: string,
        @CurrentUser('userId') viewerUserId?: string,
    ): Promise<ApiResponseDto<AdopterPublicProfileResponseDto>> {
        const result = await this.getAdopterProfileUseCase.execute(userId, viewerUserId);
        return ApiResponseDto.success(result, PROFILE_RESPONSE_MESSAGES.adopterRetrieved);
    }

    @Get('breeders/:breederId')
    @ApiGetBreederProfileEndpoint()
    async getBreeder(
        @Param('breederId') breederId: string,
        @CurrentUser('userId') viewerUserId?: string,
        @CurrentUser('role') viewerRole?: string,
    ): Promise<ApiResponseDto<BreederPublicProfileResponseDto>> {
        const result = await this.getBreederProfileUseCase.execute(breederId, viewerUserId, viewerRole);
        return ApiResponseDto.success(result, PROFILE_RESPONSE_MESSAGES.breederRetrieved);
    }
}
