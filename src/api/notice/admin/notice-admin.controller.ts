import { Controller, Get, Post, Put, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';

import { NoticeAdminService } from './notice-admin.service';

import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { NoticeCreateRequestDto } from '../dto/request/notice-create-request.dto';
import { NoticeUpdateRequestDto } from '../dto/request/notice-update-request.dto';
import { NoticeResponseDto } from '../dto/response/notice-response.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';

/**
 * 공지사항 관리 컨트롤러 (관리자 전용)
 * 관리자만 접근 가능한 공지사항 관리 API
 */
@ApiTags('공지사항 관리 (관리자)')
@ApiBearerAuth('JWT-Auth')
@Controller('notice-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class NoticeAdminController {
    constructor(private readonly noticeAdminService: NoticeAdminService) {}

    /**
     * 공지사항 생성 (관리자 전용)
     */
    @Post()
    @ApiOperation({
        summary: '공지사항 생성',
        description: '새로운 공지사항을 생성합니다. (관리자 전용)',
    })
    @ApiResponse({ status: 200, description: '성공', type: NoticeResponseDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 401, description: '인증 실패' })
    @ApiResponse({ status: 403, description: '권한 없음' })
    async createNotice(
        @CurrentUser() user: any,
        @Body() createData: NoticeCreateRequestDto,
    ): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.noticeAdminService.createNotice(user.userId, user.name || '관리자', createData);
        return {
            success: true,
            code: 200,
            data: result,
            message: '공지사항이 생성되었습니다.',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 공지사항 목록 조회 (관리자 전용, 모든 상태 조회 가능)
     */
    @Get()
    @ApiOperation({
        summary: '공지사항 목록 조회 (관리자)',
        description: '모든 상태의 공지사항 목록을 조회합니다. (관리자 전용)',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: '페이지 크기', example: 10 })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['published', 'draft', 'archived'],
        description: '공지사항 상태 필터',
    })
    @ApiResponse({ status: 200, description: '성공', type: PaginationResponseDto<NoticeResponseDto> })
    async getNoticeListAdmin(
        @Query() paginationData: PaginationRequestDto,
        @Query('status') status?: 'published' | 'draft' | 'archived',
    ): Promise<ApiResponseDto<PaginationResponseDto<NoticeResponseDto>>> {
        const result = await this.noticeAdminService.getNoticeListAdmin(paginationData, status);
        return {
            success: true,
            code: 200,
            data: result,
            message: '공지사항 목록 조회 성공',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 공지사항 상세 조회 (관리자 전용, 조회수 증가 안 함)
     */
    @Get(':noticeId')
    @ApiOperation({
        summary: '공지사항 상세 조회 (관리자)',
        description: '특정 공지사항의 상세 정보를 조회합니다. 관리자 조회 시 조회수가 증가하지 않습니다.',
    })
    @ApiResponse({ status: 200, description: '성공', type: NoticeResponseDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '공지사항을 찾을 수 없음' })
    async getNoticeDetailAdmin(@Param('noticeId') noticeId: string): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.noticeAdminService.getNoticeDetailAdmin(noticeId);
        return {
            success: true,
            code: 200,
            data: result,
            message: '공지사항 조회 성공',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 공지사항 수정 (관리자 전용)
     */
    @Put(':noticeId')
    @ApiOperation({
        summary: '공지사항 수정',
        description: '기존 공지사항을 수정합니다. (관리자 전용)',
    })
    @ApiResponse({ status: 200, description: '성공', type: NoticeResponseDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '공지사항을 찾을 수 없음' })
    async updateNotice(
        @CurrentUser() user: any,
        @Param('noticeId') noticeId: string,
        @Body() updateData: NoticeUpdateRequestDto,
    ): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.noticeAdminService.updateNotice(noticeId, user.userId, updateData);
        return {
            success: true,
            code: 200,
            data: result,
            message: '공지사항이 수정되었습니다.',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 공지사항 삭제 (관리자 전용)
     */
    @Delete(':noticeId')
    @ApiOperation({
        summary: '공지사항 삭제',
        description: '공지사항을 삭제합니다. (관리자 전용)',
    })
    @ApiResponse({ status: 200, description: '성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '공지사항을 찾을 수 없음' })
    async deleteNotice(@CurrentUser() user: any, @Param('noticeId') noticeId: string): Promise<ApiResponseDto<null>> {
        await this.noticeAdminService.deleteNotice(noticeId, user.userId);
        return {
            success: true,
            code: 200,
            data: null,
            message: '공지사항이 삭제되었습니다.',
            timestamp: new Date().toISOString(),
        };
    }
}
