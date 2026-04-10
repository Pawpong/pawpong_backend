import { Param, Patch, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { Roles } from '../../../common/decorator/roles.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import type { UserAdminHardDeleteResult } from './application/types/user-admin-result.type';
import { HardDeleteUserUseCase } from './application/use-cases/hard-delete-user.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { ManagedUserRoleQueryRequestDto } from './dto/request/managed-user-role-query-request.dto';
import { USER_ADMIN_RESPONSE_MESSAGES } from './constants/user-admin-response-messages';
import { ApiHardDeleteUserAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminHardDeleteUserController {
    constructor(private readonly hardDeleteUserUseCase: HardDeleteUserUseCase) {}

    @Patch('users/:userId/hard-delete')
    @Roles('super_admin')
    @ApiHardDeleteUserAdminEndpoint()
    async hardDeleteUser(
        @CurrentUser('userId') adminId: string,
        @Param('userId', new MongoObjectIdPipe('사용자', '올바르지 않은 사용자 ID 형식입니다.')) userId: string,
        @Query() query: ManagedUserRoleQueryRequestDto,
    ): Promise<ApiResponseDto<UserAdminHardDeleteResult>> {
        const result = await this.hardDeleteUserUseCase.execute(adminId, userId, query.role);
        return ApiResponseDto.success(result, USER_ADMIN_RESPONSE_MESSAGES.userHardDeleted);
    }
}
