import { Body, Param, Patch, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import { UpdateUserStatusUseCase } from './application/use-cases/update-user-status.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { ManagedUserRoleQueryRequestDto } from './dto/request/managed-user-role-query-request.dto';
import { UserManagementRequestDto } from './dto/request/user-management-request.dto';
import { USER_ADMIN_RESPONSE_MESSAGES } from './constants/user-admin-response-messages';
import { ApiUpdateUserStatusAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminUserStatusController {
    constructor(private readonly updateUserStatusUseCase: UpdateUserStatusUseCase) {}

    @Patch('users/:userId/status')
    @ApiUpdateUserStatusAdminEndpoint()
    async updateUserStatus(
        @CurrentUser('userId') adminId: string,
        @Param('userId', new MongoObjectIdPipe('사용자', '올바르지 않은 사용자 ID 형식입니다.')) userId: string,
        @Query() query: ManagedUserRoleQueryRequestDto,
        @Body() userData: UserManagementRequestDto,
    ): Promise<ApiResponseDto<{ message: string }>> {
        const result = await this.updateUserStatusUseCase.execute(adminId, userId, query.role, userData);
        return ApiResponseDto.success(result, USER_ADMIN_RESPONSE_MESSAGES.userStatusUpdated);
    }
}
