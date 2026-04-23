import { Controller, Get, Query, Param } from '@nestjs/common';

import { PaginationRequestDto } from '../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { MongoObjectIdPipe } from '../../common/pipe/mongo-object-id.pipe';
import { AnnouncementResponseDto } from './dto/response/announcement-response.dto';
import { GetActiveAnnouncementsUseCase } from './application/use-cases/get-active-announcements.use-case';
import { GetAnnouncementByIdUseCase } from './application/use-cases/get-announcement-by-id.use-case';
import type { AnnouncementPageResult, AnnouncementResult } from './application/types/announcement-result.type';
import {
    ApiAnnouncementController,
    ApiGetActiveAnnouncementsEndpoint,
    ApiGetAnnouncementByIdEndpoint,
} from './swagger';

/**
 * 공지사항 컨트롤러 (공개 API)
 * 인증 없이 활성화된 공지사항 조회 가능
 */
@ApiAnnouncementController()
@Controller('announcement')
export class AnnouncementController {
    constructor(
        private readonly getActiveAnnouncementsUseCase: GetActiveAnnouncementsUseCase,
        private readonly getAnnouncementByIdUseCase: GetAnnouncementByIdUseCase,
    ) {}

    /**
     * 활성화된 공지사항 목록 조회
     * @param paginationDto 페이지네이션 요청 DTO
     * @returns 공지사항 목록 및 페이지네이션 정보
     */
    @Get('list')
    @ApiGetActiveAnnouncementsEndpoint()
    async getActiveAnnouncements(
        @Query() paginationDto: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AnnouncementResponseDto>> {
        const result = await this.getActiveAnnouncementsUseCase.execute(paginationDto);
        return PaginationResponseDto.fromPageResult(result as AnnouncementPageResult);
    }

    /**
     * 공지사항 상세 조회
     * @param announcementId 공지사항 ID
     * @returns 공지사항 상세 정보
     */
    @Get(':announcementId')
    @ApiGetAnnouncementByIdEndpoint()
    async getAnnouncementById(
        @Param('announcementId', new MongoObjectIdPipe('공지사항', '올바르지 않은 공지사항 ID입니다.'))
        announcementId: string,
    ): Promise<AnnouncementResponseDto> {
        const result = await this.getAnnouncementByIdUseCase.execute(announcementId);
        return result as AnnouncementResponseDto & AnnouncementResult;
    }
}
