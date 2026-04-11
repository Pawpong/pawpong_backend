import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { rethrowIfHttpException } from '../../../../../common/utils/http-exception.util';
import { NoticeItemMapperService } from '../../../domain/services/notice-item-mapper.service';
import { NOTICE_WRITER_PORT, type NoticeWriterPort } from '../ports/notice-writer.port';
import type { NoticeUpdateCommand } from '../types/notice-command.type';
import type { NoticeItemResult } from '../../../application/types/notice-result.type';

@Injectable()
export class UpdateNoticeUseCase {
    constructor(
        @Inject(NOTICE_WRITER_PORT)
        private readonly noticeWriter: NoticeWriterPort,
        private readonly noticeItemMapperService: NoticeItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(noticeId: string, adminId: string, updateData: NoticeUpdateCommand): Promise<NoticeItemResult> {
        this.logger.logStart('updateNotice', '공지사항 수정 시작', { noticeId, adminId });

        if (!noticeId) {
            throw new BadRequestException('공지사항 ID가 필요합니다.');
        }

        if (!adminId) {
            throw new BadRequestException('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const notice = await this.noticeWriter.update(noticeId, updateData);

            if (!notice) {
                throw new NotFoundException('공지사항을 찾을 수 없습니다.');
            }

            this.logger.logSuccess('updateNotice', '공지사항 수정 완료', { noticeId });
            return this.noticeItemMapperService.toItem(notice);
        } catch (error) {
            rethrowIfHttpException(error);
            this.logger.logError('updateNotice', '공지사항 수정', error);
            throw new BadRequestException('공지사항 수정에 실패했습니다.');
        }
    }
}
