import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PaginationRequestDto } from '../../../../common/dto/pagination/pagination-request.dto';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { NoticePresentationService } from '../../domain/services/notice-presentation.service';
import { NOTICE_READER, type NoticeReaderPort, type NoticeStatus } from '../ports/notice-reader.port';
import type { NoticePageResult } from '../types/notice-result.type';

@Injectable()
export class GetNoticeListUseCase {
    constructor(
        @Inject(NOTICE_READER)
        private readonly noticeReader: NoticeReaderPort,
        private readonly noticePresentationService: NoticePresentationService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        paginationData: PaginationRequestDto,
        status?: NoticeStatus,
    ): Promise<NoticePageResult> {
        this.logger.logStart('getNoticeList', '공지사항 목록 조회 시작', {
            ...paginationData,
            status,
        });

        const { page = 1, limit = 10 } = paginationData;
        const skip = (page - 1) * limit;

        try {
            const [totalItems, notices] = await Promise.all([
                this.noticeReader.countByStatus(status),
                this.noticeReader.readPage(skip, limit, status),
            ]);

            this.logger.logSuccess('getNoticeList', '공지사항 목록 조회 완료', {
                totalItems,
                currentPage: page,
            });

            return this.noticePresentationService.buildPage(notices, page, limit, totalItems);
        } catch (error) {
            this.logger.logError('getNoticeList', '공지사항 목록 조회', error);
            throw new BadRequestException('공지사항 목록 조회에 실패했습니다.');
        }
    }
}
