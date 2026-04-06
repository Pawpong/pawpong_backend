import { Injectable } from '@nestjs/common';

import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { NoticeCreateRequestDto } from '../dto/request/notice-create-request.dto';
import { NoticeUpdateRequestDto } from '../dto/request/notice-update-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { NoticeResponseDto } from '../dto/response/notice-response.dto';
import { GetNoticeListUseCase } from '../application/use-cases/get-notice-list.use-case';
import { GetNoticeDetailUseCase } from '../application/use-cases/get-notice-detail.use-case';
import { NoticeStatus } from '../application/ports/notice-reader.port';
import { CreateNoticeUseCase } from './application/use-cases/create-notice.use-case';
import { UpdateNoticeUseCase } from './application/use-cases/update-notice.use-case';
import { DeleteNoticeUseCase } from './application/use-cases/delete-notice.use-case';

/**
 * 공지사항 관리 서비스 (관리자 전용)
 * 관리자 전용 공지사항 CRUD 및 관리 기능 제공
 */
@Injectable()
export class NoticeAdminService {
    constructor(
        private readonly getNoticeListUseCase: GetNoticeListUseCase,
        private readonly getNoticeDetailUseCase: GetNoticeDetailUseCase,
        private readonly createNoticeUseCase: CreateNoticeUseCase,
        private readonly updateNoticeUseCase: UpdateNoticeUseCase,
        private readonly deleteNoticeUseCase: DeleteNoticeUseCase,
    ) {}

    /**
     * 공지사항 목록 조회 (관리자 전용 - 모든 상태 조회 가능)
     */
    async getNoticeListAdmin(
        paginationData: PaginationRequestDto,
        status?: NoticeStatus,
    ): Promise<PaginationResponseDto<NoticeResponseDto>> {
        return this.getNoticeListUseCase.execute(paginationData, status);
    }

    /**
     * 공지사항 상세 조회 (관리자 전용 - 조회수 증가 안 함)
     */
    async getNoticeDetailAdmin(noticeId: string): Promise<NoticeResponseDto> {
        return this.getNoticeDetailUseCase.execute(noticeId, false);
    }

    /**
     * 공지사항 수정 (관리자 전용)
     */
    async createNotice(
        adminId: string,
        adminName: string,
        createData: NoticeCreateRequestDto,
    ): Promise<NoticeResponseDto> {
        return this.createNoticeUseCase.execute(adminId, adminName, createData);
    }

    async updateNotice(
        noticeId: string,
        adminId: string,
        updateData: NoticeUpdateRequestDto,
    ): Promise<NoticeResponseDto> {
        return this.updateNoticeUseCase.execute(noticeId, adminId, updateData);
    }

    /**
     * 공지사항 삭제 (관리자 전용)
     */
    async deleteNotice(noticeId: string, adminId: string): Promise<void> {
        return this.deleteNoticeUseCase.execute(noticeId, adminId);
    }
}
