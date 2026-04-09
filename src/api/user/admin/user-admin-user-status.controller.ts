import { Body, Param, Patch, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { UpdateUserStatusUseCase } from './application/use-cases/update-user-status.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { UserManagementRequestDto } from './dto/request/user-management-request.dto';
import { USER_ADMIN_RESPONSE_MESSAGES } from './domain/services/user-admin-response-message.service';
import { ApiUpdateUserStatusAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminUserStatusController {
    constructor(private readonly updateUserStatusUseCase: UpdateUserStatusUseCase) {}

    @Patch('users/:userId/status')
    @ApiUpdateUserStatusAdminEndpoint()
    async updateUserStatus(
        @CurrentUser('userId') adminId: string,
        @Param('userId') userId: string,
        @Query('role') role: 'adopter' | 'breeder',
        @Body() userData: UserManagementRequestDto,
    ): Promise<ApiResponseDto<{ message: string }>> {
        const result = await this.updateUserStatusUseCase.execute(adminId, userId, role, userData);
        return ApiResponseDto.success(result, USER_ADMIN_RESPONSE_MESSAGES.userStatusUpdated);
    }
}
