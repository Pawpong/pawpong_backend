import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { NoticeResponseDto } from '../../dto/response/notice-response.dto';
import { NoticePresentationService } from '../../domain/services/notice-presentation.service';
import { NOTICE_READER, type NoticeReaderPort } from '../ports/notice-reader.port';

@Injectable()
export class GetNoticeDetailUseCase {
    constructor(
        @Inject(NOTICE_READER)
        private readonly noticeReader: NoticeReaderPort,
        private readonly noticePresentationService: NoticePresentationService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(noticeId: string, increaseView: boolean = true): Promise<NoticeResponseDto> {
        this.logger.logStart('getNoticeDetail', '공지사항 상세 조회 시작', { noticeId, increaseView });

        if (!noticeId) {
            throw new BadRequestException('공지사항 ID가 필요합니다.');
        }

        try {
            const notice = await this.noticeReader.readById(noticeId);

            if (!notice) {
                throw new NotFoundException('공지사항을 찾을 수 없습니다.');
            }

            if (increaseView) {
                await this.noticeReader.incrementViewCount(noticeId);
            }

            this.logger.logSuccess('getNoticeDetail', '공지사항 상세 조회 완료', { noticeId });
            return this.noticePresentationService.toResponseDto(notice);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            this.logger.logError('getNoticeDetail', '공지사항 상세 조회', error);
            throw new BadRequestException('공지사항 조회에 실패했습니다.');
        }
    }
}
