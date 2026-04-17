import { Body, Get, Patch } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { BreederProfileResponseDto } from '../breeder/dto/response/breeder-profile-response.dto';
import { GetBreederManagementProfileUseCase } from './application/use-cases/get-breeder-management-profile.use-case';
import { UpdateBreederManagementProfileUseCase } from './application/use-cases/update-breeder-management-profile.use-case';
import type { BreederManagementProfileResult } from './application/types/breeder-management-result.type';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './constants/breeder-management-response-messages';
import { ProfileUpdateRequestDto } from './dto/request/profile-update-request.dto';
import { BreederProfileUpdateResponseDto } from './dto/response/profile-update-response.dto';
import { ApiUpdateBreederManagementProfileEndpoint, BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementProfileInfoController {
    constructor(
        private readonly getBreederManagementProfileUseCase: GetBreederManagementProfileUseCase,
        private readonly updateBreederManagementProfileUseCase: UpdateBreederManagementProfileUseCase,
    ) {}

    @Get('profile')
    @ApiEndpoint(BreederManagementSwaggerDocs.profile)
    async getProfile(@CurrentUser('userId') userId: string): Promise<ApiResponseDto<BreederProfileResponseDto>> {
        const result = await this.getBreederManagementProfileUseCase.execute(userId);
        return ApiResponseDto.success(
            result as BreederProfileResponseDto & BreederManagementProfileResult,
            BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileRetrieved,
        );
    }

    @Patch('profile')
    @ApiUpdateBreederManagementProfileEndpoint()
    async updateProfile(
        @CurrentUser('userId') userId: string,
        @Body() updateData: ProfileUpdateRequestDto,
    ): Promise<ApiResponseDto<BreederProfileUpdateResponseDto>> {
        const result = await this.updateBreederManagementProfileUseCase.execute(userId, updateData);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileUpdated);
    }
}
