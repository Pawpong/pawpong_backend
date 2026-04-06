import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { NoticeResponseDto } from '../../../dto/response/notice-response.dto';
import { NoticeUpdateRequestDto } from '../../../dto/request/notice-update-request.dto';
import { NoticePresentationService } from '../../../domain/services/notice-presentation.service';
import { NOTICE_WRITER, type NoticeWriterPort } from '../ports/notice-writer.port';

@Injectable()
export class UpdateNoticeUseCase {
    constructor(
        @Inject(NOTICE_WRITER)
        private readonly noticeWriter: NoticeWriterPort,
        private readonly noticePresentationService: NoticePresentationService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(noticeId: string, adminId: string, updateData: NoticeUpdateRequestDto): Promise<NoticeResponseDto> {
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
            return this.noticePresentationService.toResponseDto(notice);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.logError('updateNotice', '공지사항 수정', error);
            throw new BadRequestException('공지사항 수정에 실패했습니다.');
        }
    }
}
