import { Body, Get, Patch } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetAdopterProfileUseCase } from './application/use-cases/get-adopter-profile.use-case';
import { UpdateAdopterProfileUseCase } from './application/use-cases/update-adopter-profile.use-case';
import type { AdopterProfileResult } from './application/types/adopter-result.type';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { ProfileUpdateRequestDto } from './dto/request/profile-update-request.dto';
import { AdopterProfileResponseDto } from './dto/response/adopter-profile-response.dto';
import { AdopterProfileUpdateResponseDto } from './dto/response/profile-update-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from './domain/services/adopter-response-message.service';
import { ApiGetAdopterProfileEndpoint, ApiUpdateAdopterProfileEndpoint } from './swagger';

@AdopterProtectedController()
export class AdopterProfileController {
    constructor(
        private readonly getAdopterProfileUseCase: GetAdopterProfileUseCase,
        private readonly updateAdopterProfileUseCase: UpdateAdopterProfileUseCase,
    ) {}

    @Get('profile')
    @ApiGetAdopterProfileEndpoint()
    async getProfile(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<AdopterProfileResponseDto>> {
        const result = await this.getAdopterProfileUseCase.execute(userId);
        return ApiResponseDto.success(
            result as AdopterProfileResponseDto & AdopterProfileResult,
            ADOPTER_RESPONSE_MESSAGES.profileRetrieved,
        );
    }

    @Patch('profile')
    @ApiUpdateAdopterProfileEndpoint()
    async updateProfile(
        @CurrentUser('userId') userId: string,
        @Body() updateData: ProfileUpdateRequestDto,
    ): Promise<ApiResponseDto<AdopterProfileUpdateResponseDto>> {
        const result = await this.updateAdopterProfileUseCase.execute(userId, updateData);
        return ApiResponseDto.success(result, ADOPTER_RESPONSE_MESSAGES.profileUpdated);
    }
}
