import { Get, Param, Patch, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { Roles } from '../../../common/decorator/roles.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { GetDeletedUsersUseCase } from './application/use-cases/get-deleted-users.use-case';
import { GetDeletedUserStatsUseCase } from './application/use-cases/get-deleted-user-stats.use-case';
import { HardDeleteUserUseCase } from './application/use-cases/hard-delete-user.use-case';
import { RestoreDeletedUserUseCase } from './application/use-cases/restore-deleted-user.use-case';
import { DeletedUserSearchRequestDto } from './dto/request/deleted-user-search-request.dto';
import { DeletedUserResponseDto } from './dto/response/deleted-user-response.dto';
import { DeletedUserStatsResponseDto } from './dto/response/deleted-user-stats-response.dto';
import { UserStatusUpdateResponseDto } from './dto/response/user-status-update-response.dto';
import {
    ApiGetDeletedUserStatsAdminEndpoint,
    ApiGetDeletedUsersAdminEndpoint,
    ApiHardDeleteUserAdminEndpoint,
    ApiRestoreDeletedUserAdminEndpoint,
} from './swagger';

@UserAdminProtectedController()
export class UserAdminDeletedUsersController {
    constructor(
        private readonly getDeletedUsersUseCase: GetDeletedUsersUseCase,
        private readonly getDeletedUserStatsUseCase: GetDeletedUserStatsUseCase,
        private readonly restoreDeletedUserUseCase: RestoreDeletedUserUseCase,
        private readonly hardDeleteUserUseCase: HardDeleteUserUseCase,
    ) {}

    @Get('deleted-users')
    @ApiGetDeletedUsersAdminEndpoint()
    async getDeletedUsers(
        @CurrentUser('userId') adminId: string,
        @Query() filter: DeletedUserSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<DeletedUserResponseDto>>> {
        const result = await this.getDeletedUsersUseCase.execute(adminId, filter);
        return ApiResponseDto.success(result, '탈퇴 사용자 목록이 조회되었습니다.');
    }

    @Get('deleted-users/stats')
    @ApiGetDeletedUserStatsAdminEndpoint()
    async getDeletedUserStats(@CurrentUser('userId') adminId: string): Promise<ApiResponseDto<DeletedUserStatsResponseDto>> {
        const result = await this.getDeletedUserStatsUseCase.execute(adminId);
        return ApiResponseDto.success(result, '탈퇴 사용자 통계가 조회되었습니다.');
    }

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

    @Patch('users/:userId/hard-delete')
    @Roles('super_admin')
    @ApiHardDeleteUserAdminEndpoint()
    async hardDeleteUser(
        @CurrentUser('userId') adminId: string,
        @Param('userId') userId: string,
        @Query('role') role: 'adopter' | 'breeder',
    ): Promise<ApiResponseDto<any>> {
        const result = await this.hardDeleteUserUseCase.execute(adminId, userId, role);
        return ApiResponseDto.success(result, '사용자가 영구적으로 삭제되었습니다.');
    }
}
