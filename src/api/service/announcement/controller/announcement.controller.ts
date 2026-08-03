import { Controller, Get, Query, Param } from '@nestjs/common';

import { PaginationRequestDto } from '../../../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { MongoObjectIdPipe } from '../../../../common/pipe/mongo-object-id.pipe';
import { AnnouncementResponseDto } from '../dto/response/announcement-response.dto';
import { GetActiveAnnouncementsUseCase } from '../application/use-cases/get-active-announcements.use-case';
import { GetAnnouncementByIdUseCase } from '../application/use-cases/get-announcement-by-id.use-case';
import type { AnnouncementPageResult, AnnouncementResult } from '../application/types/announcement-result.type';
import {
    ApiAnnouncementController,
    ApiGetActiveAnnouncementsEndpoint,
    ApiGetAnnouncementByIdEndpoint,
} from '../swagger/index';

/**
 * 공지사항 컨트롤러 (공개 API)
 * 인증 없이 활성화된 공지사항 조회 가능
 */
@ApiAnnouncementController()
@Controller('v2/announcement')
export class AnnouncementController {
    constructor(
        private readonly getActiveAnnouncementsUseCase: GetActiveAnnouncementsUseCase,
        private readonly getAnnouncementByIdUseCase: GetAnnouncementByIdUseCase,
    ) {}

    // 활성화된 공지사항 목록 조회
    // JSDoc 블록으로 쓰면 swagger 플러그인(introspectComments)이 이 문구로
    // ApiOperation 을 덮어써 summary 가 사라진다. 문서는 swagger/index.ts 가 소유한다.
    @Get('list')
    @ApiGetActiveAnnouncementsEndpoint()
    async getActiveAnnouncements(
        @Query() paginationDto: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AnnouncementResponseDto>> {
        const result = await this.getActiveAnnouncementsUseCase.execute(paginationDto);
        return PaginationResponseDto.fromPageResult(result);
    }

    // 공지사항 상세 조회
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
