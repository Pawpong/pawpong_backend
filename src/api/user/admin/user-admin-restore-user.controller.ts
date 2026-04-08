import { Param, Patch, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { RestoreDeletedUserUseCase } from './application/use-cases/restore-deleted-user.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { UserStatusUpdateResponseDto } from './dto/response/user-status-update-response.dto';
import { ApiRestoreDeletedUserAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminRestoreUserController {
    constructor(private readonly restoreDeletedUserUseCase: RestoreDeletedUserUseCase) {}

    @Patch('deleted-users/:userId/restore')
    @ApiRestoreDeletedUserAdminEndpoint()
    async restoreDeletedUser(
        @CurrentUser('userId') adminId: string,
        @Param('userId') userId: string,
        @Query('role') role: 'adopter' | 'breeder',
    ): Promise<ApiResponseDto<UserStatusUpdateResponseDto>> {
        const result = await this.restoreDeletedUserUseCase.execute(adminId, userId, role);
        return ApiResponseDto.success(result, '탈퇴 사용자가 복구되었습니다.');
    }
}
