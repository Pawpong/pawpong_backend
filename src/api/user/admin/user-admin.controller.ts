import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';

import { UserSearchRequestDto } from './dto/request/user-search-request.dto';
import { UserManagementRequestDto } from './dto/request/user-management-request.dto';
import { DeletedUserSearchRequestDto } from './dto/request/deleted-user-search-request.dto';
import { AddPhoneWhitelistRequestDto, UpdatePhoneWhitelistRequestDto } from './dto/request/phone-whitelist-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { AdminProfileResponseDto } from './dto/response/admin-profile-response.dto';
import { UserManagementResponseDto } from './dto/response/user-management-response.dto';
import { UserStatusUpdateResponseDto } from './dto/response/user-status-update-response.dto';
import { DeletedUserResponseDto } from './dto/response/deleted-user-response.dto';
import { DeletedUserStatsResponseDto } from './dto/response/deleted-user-stats-response.dto';
import { PhoneWhitelistResponseDto, PhoneWhitelistListResponseDto } from './dto/response/phone-whitelist-response.dto';
import { AddPhoneWhitelistUseCase } from './application/use-cases/add-phone-whitelist.use-case';
import { DeletePhoneWhitelistUseCase } from './application/use-cases/delete-phone-whitelist.use-case';
import { GetAdminProfileUseCase } from './application/use-cases/get-admin-profile.use-case';
import { GetDeletedUsersUseCase } from './application/use-cases/get-deleted-users.use-case';
import { GetDeletedUserStatsUseCase } from './application/use-cases/get-deleted-user-stats.use-case';
import { GetPhoneWhitelistUseCase } from './application/use-cases/get-phone-whitelist.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { HardDeleteUserUseCase } from './application/use-cases/hard-delete-user.use-case';
import { RestoreDeletedUserUseCase } from './application/use-cases/restore-deleted-user.use-case';
import { UpdatePhoneWhitelistUseCase } from './application/use-cases/update-phone-whitelist.use-case';
import { UpdateUserStatusUseCase } from './application/use-cases/update-user-status.use-case';
import {
    ApiAddPhoneWhitelistAdminEndpoint,
    ApiDeletePhoneWhitelistAdminEndpoint,
    ApiGetDeletedUserStatsAdminEndpoint,
    ApiGetDeletedUsersAdminEndpoint,
    ApiGetPhoneWhitelistAdminEndpoint,
    ApiGetUserAdminProfileEndpoint,
    ApiGetUsersAdminEndpoint,
    ApiHardDeleteUserAdminEndpoint,
    ApiRestoreDeletedUserAdminEndpoint,
    ApiUpdatePhoneWhitelistAdminEndpoint,
    ApiUpdateUserStatusAdminEndpoint,
    ApiUserAdminController,
} from './swagger';

/**
 * 사용자 관리 Admin 컨트롤러
 *
 * 사용자 관리 관련 관리자 기능을 제공합니다:
 * - 관리자 프로필 관리
 * - 통합 사용자 관리 (입양자 + 브리더)
 * - 사용자 상태 변경
 * - 전화번호 화이트리스트 관리
 */
@ApiUserAdminController()
@Controller('user-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UserAdminController {
    constructor(
        private readonly getAdminProfileUseCase: GetAdminProfileUseCase,
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
        private readonly getDeletedUsersUseCase: GetDeletedUsersUseCase,
        private readonly getDeletedUserStatsUseCase: GetDeletedUserStatsUseCase,
        private readonly restoreDeletedUserUseCase: RestoreDeletedUserUseCase,
        private readonly hardDeleteUserUseCase: HardDeleteUserUseCase,
        private readonly getPhoneWhitelistUseCase: GetPhoneWhitelistUseCase,
        private readonly addPhoneWhitelistUseCase: AddPhoneWhitelistUseCase,
        private readonly updatePhoneWhitelistUseCase: UpdatePhoneWhitelistUseCase,
        private readonly deletePhoneWhitelistUseCase: DeletePhoneWhitelistUseCase,
    ) {}

    @Get('profile')
    @ApiGetUserAdminProfileEndpoint()
    async getProfile(@CurrentUser('userId') adminId: string): Promise<ApiResponseDto<AdminProfileResponseDto>> {
        const result = await this.getAdminProfileUseCase.execute(adminId);
        return ApiResponseDto.success(result, '관리자 프로필이 조회되었습니다.');
    }

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

    @Get('phone-whitelist')
    @ApiGetPhoneWhitelistAdminEndpoint()
    async getPhoneWhitelist(): Promise<ApiResponseDto<PhoneWhitelistListResponseDto>> {
        const result = await this.getPhoneWhitelistUseCase.execute();
        return ApiResponseDto.success(result, '화이트리스트가 조회되었습니다.');
    }

    @Post('phone-whitelist')
    @ApiAddPhoneWhitelistAdminEndpoint()
    async addPhoneWhitelist(
        @CurrentUser('userId') adminId: string,
        @Body() dto: AddPhoneWhitelistRequestDto,
    ): Promise<ApiResponseDto<PhoneWhitelistResponseDto>> {
        const result = await this.addPhoneWhitelistUseCase.execute(adminId, dto);
        return ApiResponseDto.success(result, '화이트리스트에 추가되었습니다.');
    }

    @Patch('phone-whitelist/:id')
    @ApiUpdatePhoneWhitelistAdminEndpoint()
    async updatePhoneWhitelist(
        @Param('id') id: string,
        @Body() dto: UpdatePhoneWhitelistRequestDto,
    ): Promise<ApiResponseDto<PhoneWhitelistResponseDto>> {
        const result = await this.updatePhoneWhitelistUseCase.execute(id, dto);
        return ApiResponseDto.success(result, '화이트리스트가 수정되었습니다.');
    }

    @Delete('phone-whitelist/:id')
    @ApiDeletePhoneWhitelistAdminEndpoint()
    async deletePhoneWhitelist(@Param('id') id: string): Promise<ApiResponseDto<{ message: string }>> {
        const result = await this.deletePhoneWhitelistUseCase.execute(id);
        return ApiResponseDto.success(result, result.message);
    }
}
