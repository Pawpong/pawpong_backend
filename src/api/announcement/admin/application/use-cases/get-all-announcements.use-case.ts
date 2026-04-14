import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { rethrowIfHttpException } from '../../../../../common/utils/http-exception.util';
import { AnnouncementPageAssemblerService } from '../../../domain/services/announcement-page-assembler.service';
import {
    ANNOUNCEMENT_ADMIN_READER_PORT,
    type AnnouncementAdminReaderPort,
} from '../ports/announcement-admin-reader.port';
import type { AnnouncementPageQuery } from '../../../application/types/announcement-query.type';
import type { AnnouncementPageResult } from '../../../application/types/announcement-result.type';

@Injectable()
export class GetAllAnnouncementsUseCase {
    constructor(
        @Inject(ANNOUNCEMENT_ADMIN_READER_PORT)
        private readonly announcementAdminReader: AnnouncementAdminReaderPort,
        private readonly announcementPageAssemblerService: AnnouncementPageAssemblerService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(paginationDto: AnnouncementPageQuery): Promise<AnnouncementPageResult> {
        const page = paginationDto.page ?? 1;
        const limit = paginationDto.limit ?? 10;

        this.logger.logStart('getAllAnnouncements', '관리자 공지사항 목록 조회', {
            page,
            take: limit,
        });

        try {
            const result = await this.announcementAdminReader.findAllAnnouncements({
                page,
                limit,
            });

            this.logger.logSuccess('getAllAnnouncements', '관리자 공지사항 목록 조회 완료', {
                totalCount: result.totalCount,
                itemsCount: result.items.length,
            });

            return this.announcementPageAssemblerService.build(result);
        } catch (error) {
            rethrowIfHttpException(error);
            this.logger.logError('getAllAnnouncements', '관리자 공지사항 목록 조회 실패', error);
            throw new BadRequestException('공지사항 목록을 조회할 수 없습니다.');
        }
    }
}
