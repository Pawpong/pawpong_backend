import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { NoticePageAssemblerService } from '../../domain/services/notice-page-assembler.service';
import { NOTICE_READER_PORT, type NoticeReaderPort, type NoticeStatus } from '../ports/notice-reader.port';
import type { NoticePageQuery } from '../types/notice-query.type';
import type { NoticePageResult } from '../types/notice-result.type';

@Injectable()
export class GetNoticeListUseCase {
    constructor(
        @Inject(NOTICE_READER_PORT)
        private readonly noticeReader: NoticeReaderPort,
        private readonly noticePageAssemblerService: NoticePageAssemblerService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(paginationData: NoticePageQuery, status?: NoticeStatus): Promise<NoticePageResult> {
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

            return this.noticePageAssemblerService.build(notices, page, limit, totalItems);
        } catch (error) {
            this.logger.logError('getNoticeList', '공지사항 목록 조회', error);
            throw error;
        }
    }
}
