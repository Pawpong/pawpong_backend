import { BadRequestException, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { PaginationRequestDto } from '../../../../../common/dto/pagination/pagination-request.dto';
import { AnnouncementResponseMapperService } from '../../../domain/services/announcement-response-mapper.service';
import { AnnouncementAdminReaderPort } from '../ports/announcement-admin-reader.port';
import type { AnnouncementPageResult } from '../../../application/types/announcement-result.type';

@Injectable()
export class GetAllAnnouncementsUseCase {
    constructor(
        private readonly announcementAdminReader: AnnouncementAdminReaderPort,
        private readonly announcementResponseMapperService: AnnouncementResponseMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        paginationDto: PaginationRequestDto,
    ): Promise<AnnouncementPageResult> {
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

            return this.announcementResponseMapperService.toPaginationResponse(result);
        } catch (error) {
            this.logger.logError('getAllAnnouncements', '관리자 공지사항 목록 조회 실패', error);
            throw new BadRequestException('공지사항 목록을 조회할 수 없습니다.');
        }
    }
}
