import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { AnnouncementCreateRequestDto } from '../dto/request/announcement-create-request.dto';
import { AnnouncementUpdateRequestDto } from '../dto/request/announcement-update-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { AnnouncementResponseDto } from '../dto/response/announcement-response.dto';
import { CreateAnnouncementUseCase } from './application/use-cases/create-announcement.use-case';
import { DeleteAnnouncementUseCase } from './application/use-cases/delete-announcement.use-case';
import { GetAllAnnouncementsUseCase } from './application/use-cases/get-all-announcements.use-case';
import { UpdateAnnouncementUseCase } from './application/use-cases/update-announcement.use-case';
import {
    ApiAnnouncementAdminController,
    ApiCreateAnnouncementAdminEndpoint,
    ApiDeleteAnnouncementAdminEndpoint,
    ApiGetAllAnnouncementsAdminEndpoint,
    ApiUpdateAnnouncementAdminEndpoint,
} from './swagger';

/**
 * 공지사항 관리자 컨트롤러
 * 관리자 전용 CRUD 기능 제공
 */
@ApiAnnouncementAdminController()
@Controller('announcement-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AnnouncementAdminController {
    constructor(
        private readonly getAllAnnouncementsUseCase: GetAllAnnouncementsUseCase,
        private readonly createAnnouncementUseCase: CreateAnnouncementUseCase,
        private readonly updateAnnouncementUseCase: UpdateAnnouncementUseCase,
        private readonly deleteAnnouncementUseCase: DeleteAnnouncementUseCase,
    ) {}

    /**
     * 공지사항 목록 조회 (관리자용 - 모든 상태 포함)
     * @param paginationDto 페이지네이션 요청 DTO
     * @returns 공지사항 목록 및 페이지네이션 정보
     */
    @Get('announcements')
    @ApiGetAllAnnouncementsAdminEndpoint()
    async getAllAnnouncements(
        @Query() paginationDto: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AnnouncementResponseDto>> {
        return this.getAllAnnouncementsUseCase.execute(paginationDto);
    }

    /**
     * 공지사항 생성
     * @param createDto 공지사항 생성 요청 DTO
     * @returns 생성된 공지사항 정보
     */
    @Post('announcement')
    @ApiCreateAnnouncementAdminEndpoint()
    async createAnnouncement(@Body() createDto: AnnouncementCreateRequestDto): Promise<AnnouncementResponseDto> {
        return this.createAnnouncementUseCase.execute(createDto);
    }

    /**
     * 공지사항 수정
     * @param announcementId 공지사항 ID
     * @param updateDto 공지사항 수정 요청 DTO
     * @returns 수정된 공지사항 정보
     */
    @Put('announcement/:announcementId')
    @ApiUpdateAnnouncementAdminEndpoint()
    async updateAnnouncement(
        @Param('announcementId') announcementId: string,
        @Body() updateDto: AnnouncementUpdateRequestDto,
    ): Promise<AnnouncementResponseDto> {
        return this.updateAnnouncementUseCase.execute(announcementId, updateDto);
    }

    /**
     * 공지사항 삭제
     * @param announcementId 공지사항 ID
     */
    @Delete('announcement/:announcementId')
    @ApiDeleteAnnouncementAdminEndpoint()
    async deleteAnnouncement(@Param('announcementId') announcementId: string): Promise<void> {
        return this.deleteAnnouncementUseCase.execute(announcementId);
    }
}
