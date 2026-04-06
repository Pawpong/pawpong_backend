import { Injectable } from '@nestjs/common';

import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { AnnouncementCreateRequestDto } from '../dto/request/announcement-create-request.dto';
import { AnnouncementUpdateRequestDto } from '../dto/request/announcement-update-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { AnnouncementResponseDto } from '../dto/response/announcement-response.dto';
import { GetAllAnnouncementsUseCase } from './application/use-cases/get-all-announcements.use-case';
import { CreateAnnouncementUseCase } from './application/use-cases/create-announcement.use-case';
import { UpdateAnnouncementUseCase } from './application/use-cases/update-announcement.use-case';
import { DeleteAnnouncementUseCase } from './application/use-cases/delete-announcement.use-case';

/**
 * 공지사항 관리자 서비스
 * 관리자 전용 CRUD 기능 제공
 */
@Injectable()
export class AnnouncementAdminService {
    constructor(
        private readonly getAllAnnouncementsUseCase: GetAllAnnouncementsUseCase,
        private readonly createAnnouncementUseCase: CreateAnnouncementUseCase,
        private readonly updateAnnouncementUseCase: UpdateAnnouncementUseCase,
        private readonly deleteAnnouncementUseCase: DeleteAnnouncementUseCase,
    ) {}

    /**
     * 공지사항 목록 조회 (관리자용 - 비활성화된 것도 포함)
     * @param paginationDto 페이지네이션 요청 DTO
     * @returns 공지사항 목록 및 페이지네이션 정보
     */
    async getAllAnnouncements(
        paginationDto: PaginationRequestDto,
    ): Promise<PaginationResponseDto<AnnouncementResponseDto>> {
        return this.getAllAnnouncementsUseCase.execute(paginationDto);
    }

    /**
     * 공지사항 생성 (관리자 전용)
     * @param createDto 공지사항 생성 요청 DTO
     * @returns 생성된 공지사항 정보
     */
    async createAnnouncement(createDto: AnnouncementCreateRequestDto): Promise<AnnouncementResponseDto> {
        return this.createAnnouncementUseCase.execute(createDto);
    }

    /**
     * 공지사항 수정 (관리자 전용)
     * @param announcementId 공지사항 ID
     * @param updateDto 공지사항 수정 요청 DTO
     * @returns 수정된 공지사항 정보
     */
    async updateAnnouncement(
        announcementId: string,
        updateDto: AnnouncementUpdateRequestDto,
    ): Promise<AnnouncementResponseDto> {
        return this.updateAnnouncementUseCase.execute(announcementId, updateDto);
    }

    /**
     * 공지사항 삭제 (관리자 전용)
     * @param announcementId 공지사항 ID
     */
    async deleteAnnouncement(announcementId: string): Promise<void> {
        return this.deleteAnnouncementUseCase.execute(announcementId);
    }
}
