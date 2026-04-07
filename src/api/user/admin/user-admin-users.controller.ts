import { Body, Get, Patch, Param, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { UpdateUserStatusUseCase } from './application/use-cases/update-user-status.use-case';
import { UserManagementRequestDto } from './dto/request/user-management-request.dto';
import { UserSearchRequestDto } from './dto/request/user-search-request.dto';
import { UserManagementResponseDto } from './dto/response/user-management-response.dto';
import { ApiGetUsersAdminEndpoint, ApiUpdateUserStatusAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminUsersController {
    constructor(
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
    ) {}

    @Get('users')
    @ApiGetUsersAdminEndpoint()
    async getUsers(
        @CurrentUser('userId') adminId: string,
        @Query() filter: UserSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<UserManagementResponseDto>>> {
        const result = await this.getUsersUseCase.execute(adminId, filter);
        return ApiResponseDto.success(result, '사용자 목록이 조회되었습니다.');
    }

    @Patch('users/:userId/status')
    @ApiUpdateUserStatusAdminEndpoint()
    async updateUserStatus(
        @CurrentUser('userId') adminId: string,
        @Param('userId') userId: string,
        @Query('role') role: 'adopter' | 'breeder',
        @Body() userData: UserManagementRequestDto,
    ): Promise<ApiResponseDto<{ message: string }>> {
        const result = await this.updateUserStatusUseCase.execute(adminId, userId, role, userData);
        return ApiResponseDto.success(result, '사용자 상태가 변경되었습니다.');
    }
}
