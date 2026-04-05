import { Injectable } from '@nestjs/common';

import { PaginationRequestDto } from '../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { AnnouncementResponseDto } from './dto/response/announcement-response.dto';
import { GetActiveAnnouncementsUseCase } from './application/use-cases/get-active-announcements.use-case';
import { GetAnnouncementByIdUseCase } from './application/use-cases/get-announcement-by-id.use-case';

/**
 * 공지사항 서비스 (공개 API용)
 * 활성화된 공지사항만 조회 가능
 */
@Injectable()
export class AnnouncementService {
    constructor(
        private readonly getActiveAnnouncementsUseCase: GetActiveAnnouncementsUseCase,
        private readonly getAnnouncementByIdUseCase: GetAnnouncementByIdUseCase,
    ) {}

    /**
     * 활성화된 공지사항 목록 조회 (페이지네이션)
     * @param paginationDto 페이지네이션 요청 DTO
     * @returns 공지사항 목록 및 페이지네이션 정보
     */
    async getActiveAnnouncements(
        paginationDto: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AnnouncementResponseDto>> {
        return this.getActiveAnnouncementsUseCase.execute(paginationDto);
    }

    /**
     * 특정 공지사항 상세 조회
     * @param announcementId 공지사항 ID
     * @returns 공지사항 상세 정보
     */
    async getAnnouncementById(announcementId: string): Promise<AnnouncementResponseDto> {
        return this.getAnnouncementByIdUseCase.execute(announcementId);
    }
}
