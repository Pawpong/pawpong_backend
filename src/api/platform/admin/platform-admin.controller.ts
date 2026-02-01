import { Controller, Get, Post, Patch, Delete, Query, Body, Param, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';

import { PlatformAdminService } from './platform-admin.service';

import { StatsFilterRequestDto } from './dto/request/stats-filter-request.dto';
import { AddPhoneWhitelistRequestDto, UpdatePhoneWhitelistRequestDto } from './dto/request/phone-whitelist-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MvpStatsResponseDto } from './dto/response/mvp-stats-response.dto';
import { AdminStatsResponseDto } from './dto/response/admin-stats-response.dto';
import { PhoneWhitelistResponseDto, PhoneWhitelistListResponseDto } from './dto/response/phone-whitelist-response.dto';

/**
 * 플랫폼 Admin 컨트롤러
 *
 * 플랫폼 전체 통계 관련 관리자 기능을 제공합니다:
 * - 플랫폼 통계 조회
 * - 전화번호 화이트리스트 관리
 */
@ApiController('플랫폼 관리자')
@Controller('platform-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PlatformAdminController {
    constructor(private readonly platformAdminService: PlatformAdminService) {}

    @Get('stats')
    @ApiEndpoint({
        summary: '플랫폼 통계 조회',
        description: '플랫폼 전체 통계 정보를 조회합니다.',
        responseType: AdminStatsResponseDto,
        isPublic: false,
    })
    async getStats(
        @CurrentUser() user: any,
        @Query() filter: StatsFilterRequestDto,
    ): Promise<ApiResponseDto<AdminStatsResponseDto>> {
        const result = await this.platformAdminService.getStats(user.userId, filter);
        return ApiResponseDto.success(result, '시스템 통계가 조회되었습니다.');
    }

    @Get('mvp-stats')
    @ApiEndpoint({
        summary: 'MVP 통계 조회',
        description:
            'MVP 단계에서 필요한 핵심 통계 정보를 조회합니다 (활성 사용자, 상담/입양 신청, 필터 사용, 브리더 재제출)',
        responseType: MvpStatsResponseDto,
        isPublic: false,
    })
    async getMvpStats(@CurrentUser() user: any): Promise<ApiResponseDto<MvpStatsResponseDto>> {
        const result = await this.platformAdminService.getMvpStats(user.userId);
        return ApiResponseDto.success(result, 'MVP 통계가 조회되었습니다.');
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
        const result = await this.platformAdminService.getPhoneWhitelist();
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
        const result = await this.platformAdminService.addPhoneWhitelist(user.userId, dto);
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
        const result = await this.platformAdminService.updatePhoneWhitelist(id, dto);
        return ApiResponseDto.success(result, '화이트리스트가 수정되었습니다.');
    }

    @Delete('phone-whitelist/:id')
    @ApiEndpoint({
        summary: '전화번호 화이트리스트 삭제',
        description: '화이트리스트에서 전화번호를 삭제합니다.',
        isPublic: false,
    })
    async deletePhoneWhitelist(@Param('id') id: string): Promise<ApiResponseDto<{ message: string }>> {
        const result = await this.platformAdminService.deletePhoneWhitelist(id);
        return ApiResponseDto.success(result, result.message);
    }
}
