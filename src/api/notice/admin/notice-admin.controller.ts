import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ApiNoticeAdminController } from './swagger';
import { ApiCreateNoticeAdminEndpoint } from './swagger';
import { ApiDeleteNoticeAdminEndpoint } from './swagger';
import { ApiGetNoticeDetailAdminEndpoint } from './swagger';
import { ApiGetNoticeListAdminEndpoint } from './swagger';
import { ApiUpdateNoticeAdminEndpoint } from './swagger';

import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { NoticeCreateRequestDto } from '../dto/request/notice-create-request.dto';
import { NoticeUpdateRequestDto } from '../dto/request/notice-update-request.dto';
import { NoticeResponseDto } from '../dto/response/notice-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { GetNoticeListUseCase } from '../application/use-cases/get-notice-list.use-case';
import { GetNoticeDetailUseCase } from '../application/use-cases/get-notice-detail.use-case';
import { NoticeStatus } from '../application/ports/notice-reader.port';
import { CreateNoticeUseCase } from './application/use-cases/create-notice.use-case';
import { UpdateNoticeUseCase } from './application/use-cases/update-notice.use-case';
import { DeleteNoticeUseCase } from './application/use-cases/delete-notice.use-case';

type NoticeAdminUser = {
    userId: string;
    name?: string;
};

/**
 * 공지사항 관리 컨트롤러 (관리자 전용)
 * 관리자만 접근 가능한 공지사항 관리 API
 */
@ApiNoticeAdminController()
@Controller('notice-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class NoticeAdminController {
    constructor(
        private readonly getNoticeListUseCase: GetNoticeListUseCase,
        private readonly getNoticeDetailUseCase: GetNoticeDetailUseCase,
        private readonly createNoticeUseCase: CreateNoticeUseCase,
        private readonly updateNoticeUseCase: UpdateNoticeUseCase,
        private readonly deleteNoticeUseCase: DeleteNoticeUseCase,
    ) {}

    /**
     * 공지사항 생성 (관리자 전용)
     */
    @Post()
    @ApiCreateNoticeAdminEndpoint()
    async createNotice(
        @CurrentUser() user: NoticeAdminUser,
        @Body() createData: NoticeCreateRequestDto,
    ): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.createNoticeUseCase.execute(user.userId, this.resolveAdminName(user), createData);
        return ApiResponseDto.success(result, '공지사항이 생성되었습니다.');
    }

    /**
     * 공지사항 목록 조회 (관리자 전용, 모든 상태 조회 가능)
     */
    @Get()
    @ApiGetNoticeListAdminEndpoint()
    async getNoticeListAdmin(
        @Query() paginationData: PaginationRequestDto,
        @Query('status') status?: 'published' | 'draft' | 'archived',
    ): Promise<ApiResponseDto<PaginationResponseDto<NoticeResponseDto>>> {
        const result = await this.getNoticeListUseCase.execute(paginationData, status as NoticeStatus | undefined);
        return ApiResponseDto.success(result, '공지사항 목록 조회 성공');
    }

    /**
     * 공지사항 상세 조회 (관리자 전용, 조회수 증가 안 함)
     */
    @Get(':noticeId')
    @ApiGetNoticeDetailAdminEndpoint()
    async getNoticeDetailAdmin(@Param('noticeId') noticeId: string): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.getNoticeDetailUseCase.execute(noticeId, false);
        return ApiResponseDto.success(result, '공지사항 조회 성공');
    }

    /**
     * 공지사항 수정 (관리자 전용)
     */
    @Patch(':noticeId')
    @ApiUpdateNoticeAdminEndpoint()
    async updateNotice(
        @CurrentUser() user: NoticeAdminUser,
        @Param('noticeId') noticeId: string,
        @Body() updateData: NoticeUpdateRequestDto,
    ): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.updateNoticeUseCase.execute(noticeId, user.userId, updateData);
        return ApiResponseDto.success(result, '공지사항이 수정되었습니다.');
    }

    /**
     * 공지사항 삭제 (관리자 전용)
     */
    @Delete(':noticeId')
    @ApiDeleteNoticeAdminEndpoint()
    async deleteNotice(@CurrentUser() user: NoticeAdminUser, @Param('noticeId') noticeId: string): Promise<ApiResponseDto<null>> {
        await this.deleteNoticeUseCase.execute(noticeId, user.userId);
        return ApiResponseDto.success(null, '공지사항이 삭제되었습니다.');
    }

    private resolveAdminName(user: NoticeAdminUser): string {
        return user.name?.trim() || '관리자';
    }
}
