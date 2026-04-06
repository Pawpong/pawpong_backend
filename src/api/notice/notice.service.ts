import { Injectable } from '@nestjs/common';

import { PaginationRequestDto } from '../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { NoticeResponseDto } from './dto/response/notice-response.dto';
import { GetNoticeListUseCase } from './application/use-cases/get-notice-list.use-case';
import { GetNoticeDetailUseCase } from './application/use-cases/get-notice-detail.use-case';
import { NoticeStatus } from './application/ports/notice-reader.port';

/**
 * 공지사항 서비스
 * 공지사항 CRUD 및 조회 기능 제공
 */
@Injectable()
export class NoticeService {
    constructor(
        private readonly getNoticeListUseCase: GetNoticeListUseCase,
        private readonly getNoticeDetailUseCase: GetNoticeDetailUseCase,
    ) {}

    async getNoticeList(
        paginationData: PaginationRequestDto,
        status?: NoticeStatus,
    ): Promise<PaginationResponseDto<NoticeResponseDto>> {
        return this.getNoticeListUseCase.execute(paginationData, status || 'published');
    }

    async getNoticeDetail(noticeId: string, increaseView: boolean = true): Promise<NoticeResponseDto> {
        return this.getNoticeDetailUseCase.execute(noticeId, increaseView);
    }
}
