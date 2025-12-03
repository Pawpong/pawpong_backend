import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from '../../../common/decorator/roles.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';

import { AnnouncementAdminService } from './announcement-admin.service';

import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { AnnouncementCreateRequestDto } from '../dto/request/announcement-create-request.dto';
import { AnnouncementUpdateRequestDto } from '../dto/request/announcement-update-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { AnnouncementResponseDto } from '../dto/response/announcement-response.dto';

/**
 * 공지사항 관리자 컨트롤러
 * 관리자 전용 CRUD 기능 제공
 */
@ApiTags('공지사항 관리')
@ApiBearerAuth('JWT-Auth')
@Controller('announcement-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AnnouncementAdminController {
    constructor(private readonly announcementAdminService: AnnouncementAdminService) {}

    /**
     * 공지사항 목록 조회 (관리자용 - 모든 상태 포함)
     * @param paginationDto 페이지네이션 요청 DTO
     * @returns 공지사항 목록 및 페이지네이션 정보
     */
    @Get('announcements')
    @ApiOperation({
        summary: '공지사항 목록 조회 (관리자)',
        description: '모든 공지사항 목록을 조회합니다. 비활성화된 공지사항도 포함됩니다.',
    })
    @ApiResponse({
        status: 200,
        description: '공지사항 목록 조회 성공',
        type: PaginationResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 요청',
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
    })
    @ApiResponse({
        status: 403,
        description: '권한 없음 (관리자만 접근 가능)',
    })
    async getAllAnnouncements(
        @Query() paginationDto: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AnnouncementResponseDto>> {
        return this.announcementAdminService.getAllAnnouncements(paginationDto);
    }

    /**
     * 공지사항 생성
     * @param createDto 공지사항 생성 요청 DTO
     * @returns 생성된 공지사항 정보
     */
    @Post('announcement')
    @ApiOperation({
        summary: '공지사항 생성',
        description: '새로운 공지사항을 생성합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '공지사항 생성 성공',
        type: AnnouncementResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 요청',
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
    })
    @ApiResponse({
        status: 403,
        description: '권한 없음 (관리자만 접근 가능)',
    })
    async createAnnouncement(@Body() createDto: AnnouncementCreateRequestDto): Promise<AnnouncementResponseDto> {
        return this.announcementAdminService.createAnnouncement(createDto);
    }

    /**
     * 공지사항 수정
     * @param announcementId 공지사항 ID
     * @param updateDto 공지사항 수정 요청 DTO
     * @returns 수정된 공지사항 정보
     */
    @Put('announcement/:announcementId')
    @ApiOperation({
        summary: '공지사항 수정',
        description: '기존 공지사항을 수정합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '공지사항 수정 성공',
        type: AnnouncementResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 요청 또는 공지사항을 찾을 수 없음',
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
    })
    @ApiResponse({
        status: 403,
        description: '권한 없음 (관리자만 접근 가능)',
    })
    async updateAnnouncement(
        @Param('announcementId') announcementId: string,
        @Body() updateDto: AnnouncementUpdateRequestDto,
    ): Promise<AnnouncementResponseDto> {
        return this.announcementAdminService.updateAnnouncement(announcementId, updateDto);
    }

    /**
     * 공지사항 삭제
     * @param announcementId 공지사항 ID
     */
    @Delete('announcement/:announcementId')
    @ApiOperation({
        summary: '공지사항 삭제',
        description: '공지사항을 삭제합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '공지사항 삭제 성공',
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 요청 또는 공지사항을 찾을 수 없음',
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
    })
    @ApiResponse({
        status: 403,
        description: '권한 없음 (관리자만 접근 가능)',
    })
    async deleteAnnouncement(@Param('announcementId') announcementId: string): Promise<void> {
        return this.announcementAdminService.deleteAnnouncement(announcementId);
    }
}
