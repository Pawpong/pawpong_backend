import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { NoticeResponseDto } from '../../../dto/response/notice-response.dto';
import { NoticeCreateRequestDto } from '../../../dto/request/notice-create-request.dto';
import { NoticePresentationService } from '../../../domain/services/notice-presentation.service';
import { NOTICE_WRITER, type NoticeWriterPort } from '../ports/notice-writer.port';

@Injectable()
export class CreateNoticeUseCase {
    constructor(
        @Inject(NOTICE_WRITER)
        private readonly noticeWriter: NoticeWriterPort,
        private readonly noticePresentationService: NoticePresentationService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(adminId: string, adminName: string, createData: NoticeCreateRequestDto): Promise<NoticeResponseDto> {
        this.logger.logStart('createNotice', '공지사항 생성 시작', { adminId, createData });

        if (!adminId) {
            throw new BadRequestException('관리자 정보가 올바르지 않습니다.');
        }

        try {
            const notice = await this.noticeWriter.create(adminId, adminName, createData);

            this.logger.logSuccess('createNotice', '공지사항 생성 완료', {
                noticeId: notice.id,
            });

            return this.noticePresentationService.toResponseDto(notice);
        } catch (error) {
            this.logger.logError('createNotice', '공지사항 생성', error);
            throw new BadRequestException('공지사항 생성에 실패했습니다.');
        }
    }
}
