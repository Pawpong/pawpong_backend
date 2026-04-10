import { Param, Patch, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import { RestoreDeletedUserUseCase } from './application/use-cases/restore-deleted-user.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { ManagedUserRoleQueryRequestDto } from './dto/request/managed-user-role-query-request.dto';
import { UserStatusUpdateResponseDto } from './dto/response/user-status-update-response.dto';
import { USER_ADMIN_RESPONSE_MESSAGES } from './constants/user-admin-response-messages';
import { ApiRestoreDeletedUserAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminRestoreUserController {
    constructor(private readonly restoreDeletedUserUseCase: RestoreDeletedUserUseCase) {}

    @Patch('deleted-users/:userId/restore')
    @ApiRestoreDeletedUserAdminEndpoint()
    async restoreDeletedUser(
        @CurrentUser('userId') adminId: string,
        @Param('userId', new MongoObjectIdPipe('사용자', '올바르지 않은 사용자 ID 형식입니다.')) userId: string,
        @Query() query: ManagedUserRoleQueryRequestDto,
    ): Promise<ApiResponseDto<UserStatusUpdateResponseDto>> {
        const result = await this.restoreDeletedUserUseCase.execute(adminId, userId, query.role);
        return ApiResponseDto.success(result, USER_ADMIN_RESPONSE_MESSAGES.deletedUserRestored);
    }
}
