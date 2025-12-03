import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AnnouncementService } from './announcement.service';

import { PaginationRequestDto } from '../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { AnnouncementResponseDto } from './dto/response/announcement-response.dto';

/**
 * 공지사항 컨트롤러 (공개 API)
 * 인증 없이 활성화된 공지사항 조회 가능
 */
@ApiTags('공지사항')
@Controller('announcement')
export class AnnouncementController {
    constructor(private readonly announcementService: AnnouncementService) {}

    /**
     * 활성화된 공지사항 목록 조회
     * @param paginationDto 페이지네이션 요청 DTO
     * @returns 공지사항 목록 및 페이지네이션 정보
     */
    @Get('list')
    @ApiOperation({
        summary: '공지사항 목록 조회',
        description: '활성화된 공지사항 목록을 페이지네이션하여 조회합니다. (인증 불필요)',
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
    async getActiveAnnouncements(
        @Query() paginationDto: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AnnouncementResponseDto>> {
        return this.announcementService.getActiveAnnouncements(paginationDto);
    }

    /**
     * 공지사항 상세 조회
     * @param announcementId 공지사항 ID
     * @returns 공지사항 상세 정보
     */
    @Get(':announcementId')
    @ApiOperation({
        summary: '공지사항 상세 조회',
        description: '특정 공지사항의 상세 정보를 조회합니다. (인증 불필요)',
    })
    @ApiResponse({
        status: 200,
        description: '공지사항 조회 성공',
        type: AnnouncementResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 요청 또는 공지사항을 찾을 수 없음',
    })
    async getAnnouncementById(@Param('announcementId') announcementId: string): Promise<AnnouncementResponseDto> {
        return this.announcementService.getAnnouncementById(announcementId);
    }
}
