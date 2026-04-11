import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { rethrowIfHttpException } from '../../../../../common/utils/http-exception.util';
import { NoticeItemMapperService } from '../../../domain/services/notice-item-mapper.service';
import { NOTICE_WRITER_PORT, type NoticeWriterPort } from '../ports/notice-writer.port';
import type { NoticeCreateCommand } from '../types/notice-command.type';
import type { NoticeItemResult } from '../../../application/types/notice-result.type';

@Injectable()
export class CreateNoticeUseCase {
    constructor(
        @Inject(NOTICE_WRITER_PORT)
        private readonly noticeWriter: NoticeWriterPort,
        private readonly noticeItemMapperService: NoticeItemMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(adminId: string, adminName: string, createData: NoticeCreateCommand): Promise<NoticeItemResult> {
        this.logger.logStart('createNotice', '공지사항 생성 시작', { adminId, createData });

        if (!adminId) {
            throw new BadRequestException('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const notice = await this.noticeWriter.create(adminId, adminName, createData);

            this.logger.logSuccess('createNotice', '공지사항 생성 완료', {
                noticeId: notice.id,
            });

            return this.noticeItemMapperService.toItem(notice);
        } catch (error) {
            rethrowIfHttpException(error);
            this.logger.logError('createNotice', '공지사항 생성', error);
            throw new BadRequestException('공지사항 생성에 실패했습니다.');
        }
    }
}
