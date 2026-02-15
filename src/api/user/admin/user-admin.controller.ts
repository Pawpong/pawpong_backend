import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';

import { UserAdminService } from './user-admin.service';

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

/**
 * 사용자 관리 Admin 컨트롤러
 *
 * 사용자 관리 관련 관리자 기능을 제공합니다:
 * - 관리자 프로필 관리
 * - 통합 사용자 관리 (입양자 + 브리더)
 * - 사용자 상태 변경
 * - 전화번호 화이트리스트 관리
 */
@ApiController('사용자 관리 관리자')
@Controller('user-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UserAdminController {
    constructor(private readonly userAdminService: UserAdminService) {}

    @Get('profile')
    @ApiEndpoint({
        summary: '관리자 프로필 조회',
        description: '관리자의 프로필 정보를 조회합니다.',
        responseType: AdminProfileResponseDto,
        isPublic: false,
    })
    async getProfile(@CurrentUser() user: any): Promise<ApiResponseDto<AdminProfileResponseDto>> {
        const result = await this.userAdminService.getAdminProfile(user.userId);
        return ApiResponseDto.success(result, '관리자 프로필이 조회되었습니다.');
    }

    @Get('users')
    @ApiEndpoint({
        summary: '통합 사용자 목록 조회',
        description: '입양자와 브리더를 통합하여 조회합니다.',
        responseType: UserManagementResponseDto,
        isPublic: false,
    })
    async getUsers(
        @CurrentUser() user: any,
        @Query() filter: UserSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<UserManagementResponseDto>>> {
        const result = await this.userAdminService.getUsers(user.userId, filter);
        return ApiResponseDto.success(result, '사용자 목록이 조회되었습니다.');
    }

    @Patch('users/:userId/status')
    @ApiEndpoint({
        summary: '사용자 상태 변경',
        description: '입양자 또는 브리더의 계정 상태를 변경합니다.',
        responseType: UserStatusUpdateResponseDto,
        isPublic: false,
    })
    async updateUserStatus(
        @CurrentUser() user: any,
        @Param('userId') userId: string,
        @Query('role') role: 'adopter' | 'breeder',
        @Body() userData: UserManagementRequestDto,
    ): Promise<ApiResponseDto<UserStatusUpdateResponseDto>> {
        const result = await this.userAdminService.updateUserStatus(user.userId, userId, role, userData);
        return ApiResponseDto.success(result, '사용자 상태가 변경되었습니다.');
    }

    @Get('deleted-users')
    @ApiEndpoint({
        summary: '탈퇴 사용자 목록 조회',
        description: '입양자와 브리더 중 탈퇴한 사용자를 조회합니다.',
        responseType: DeletedUserResponseDto,
        isPublic: false,
    })
    async getDeletedUsers(
        @CurrentUser() user: any,
        @Query() filter: DeletedUserSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<DeletedUserResponseDto>>> {
        const result = await this.userAdminService.getDeletedUsers(user.userId, filter);
        return ApiResponseDto.success(result, '탈퇴 사용자 목록이 조회되었습니다.');
    }

    @Get('deleted-users/stats')
    @ApiEndpoint({
        summary: '탈퇴 사용자 통계 조회',
        description: '탈퇴 사용자에 대한 전체 통계를 조회합니다.',
        responseType: DeletedUserStatsResponseDto,
        isPublic: false,
    })
    async getDeletedUserStats(@CurrentUser() user: any): Promise<ApiResponseDto<DeletedUserStatsResponseDto>> {
        const result = await this.userAdminService.getDeletedUserStats(user.userId);
        return ApiResponseDto.success(result, '탈퇴 사용자 통계가 조회되었습니다.');
    }

    @Patch('deleted-users/:userId/restore')
    @ApiEndpoint({
        summary: '탈퇴 사용자 복구',
        description: '탈퇴한 사용자를 active 상태로 복구합니다.',
        responseType: UserStatusUpdateResponseDto,
        isPublic: false,
    })
    async restoreDeletedUser(
        @CurrentUser() user: any,
        @Param('userId') userId: string,
        @Query('role') role: 'adopter' | 'breeder',
    ): Promise<ApiResponseDto<UserStatusUpdateResponseDto>> {
        const result = await this.userAdminService.restoreDeletedUser(user.userId, userId, role);
        return ApiResponseDto.success(result, '탈퇴 사용자가 복구되었습니다.');
    }

    @Patch('users/:userId/hard-delete')
    @Roles('super_admin')
    @ApiEndpoint({
        summary: '사용자 영구 삭제 (하드 딜리트)',
        description:
            'DB에서 사용자 데이터를 완전히 삭제합니다. deleted 상태의 사용자만 삭제 가능하며, super_admin 권한이 필요합니다.',
        responseType: UserStatusUpdateResponseDto,
        isPublic: false,
    })
    async hardDeleteUser(
        @CurrentUser() user: any,
        @Param('userId') userId: string,
        @Query('role') role: 'adopter' | 'breeder',
    ): Promise<ApiResponseDto<any>> {
        const result = await this.userAdminService.hardDeleteUser(user.userId, userId, role);
        return ApiResponseDto.success(result, '사용자가 영구적으로 삭제되었습니다.');
    }

    // ================== 전화번호 화이트리스트 관리 ==================

    @Get('phone-whitelist')
    @ApiEndpoint({
        summary: '전화번호 화이트리스트 목록 조회',
        description: '중복 가입이 허용되는 전화번호 목록을 조회합니다.',
        responseType: PhoneWhitelistListResponseDto,
        isPublic: false,
    })
    async getPhoneWhitelist(): Promise<ApiResponseDto<PhoneWhitelistListResponseDto>> {
        const result = await this.userAdminService.getPhoneWhitelist();
        return ApiResponseDto.success(result, '화이트리스트가 조회되었습니다.');
    }

    @Post('phone-whitelist')
    @ApiEndpoint({
        summary: '전화번호 화이트리스트 추가',
        description: '중복 가입을 허용할 전화번호를 화이트리스트에 추가합니다.',
        responseType: PhoneWhitelistResponseDto,
        isPublic: false,
    })
    async addPhoneWhitelist(
        @CurrentUser() user: any,
        @Body() dto: AddPhoneWhitelistRequestDto,
    ): Promise<ApiResponseDto<PhoneWhitelistResponseDto>> {
        const result = await this.userAdminService.addPhoneWhitelist(user.userId, dto);
        return ApiResponseDto.success(result, '화이트리스트에 추가되었습니다.');
    }

    @Patch('phone-whitelist/:id')
    @ApiEndpoint({
        summary: '전화번호 화이트리스트 수정',
        description: '화이트리스트 항목의 설명이나 활성 상태를 수정합니다.',
        responseType: PhoneWhitelistResponseDto,
        isPublic: false,
    })
    async updatePhoneWhitelist(
        @Param('id') id: string,
        @Body() dto: UpdatePhoneWhitelistRequestDto,
    ): Promise<ApiResponseDto<PhoneWhitelistResponseDto>> {
        const result = await this.userAdminService.updatePhoneWhitelist(id, dto);
        return ApiResponseDto.success(result, '화이트리스트가 수정되었습니다.');
    }

    @Delete('phone-whitelist/:id')
    @ApiEndpoint({
        summary: '전화번호 화이트리스트 삭제',
        description: '화이트리스트에서 전화번호를 삭제합니다.',
        isPublic: false,
    })
    async deletePhoneWhitelist(@Param('id') id: string): Promise<ApiResponseDto<{ message: string }>> {
        const result = await this.userAdminService.deletePhoneWhitelist(id);
        return ApiResponseDto.success(result, result.message);
    }
}
