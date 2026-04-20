import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError, DomainValidationError } from '../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { NoticeItemMapperService } from '../../domain/services/notice-item-mapper.service';
import { NOTICE_READER_PORT, type NoticeReaderPort } from '../ports/notice-reader.port';
import type { NoticeItemResult } from '../types/notice-result.type';

@Injectable()
export class GetNoticeDetailUseCase {
    constructor(
        @Inject(NOTICE_READER_PORT)
        private readonly noticeReader: NoticeReaderPort,
        private readonly noticeItemMapperService: NoticeItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(noticeId: string, increaseView: boolean = true): Promise<NoticeItemResult> {
        this.logger.logStart('getNoticeDetail', '공지사항 상세 조회 시작', { noticeId, increaseView });

        if (!noticeId) {
            throw new DomainValidationError('공지사항 ID가 필요합니다.');
        }

        try {
            const notice = await this.noticeReader.readById(noticeId);

            if (!notice) {
                throw new DomainNotFoundError('공지사항을 찾을 수 없습니다.');
            }

            if (increaseView) {
                await this.noticeReader.incrementViewCount(noticeId);
            }

            this.logger.logSuccess('getNoticeDetail', '공지사항 상세 조회 완료', { noticeId });
            return this.noticeItemMapperService.toItem(notice);
        } catch (error) {
            this.logger.logError('getNoticeDetail', '공지사항 상세 조회', error);
            throw error;
        }
    }
}
