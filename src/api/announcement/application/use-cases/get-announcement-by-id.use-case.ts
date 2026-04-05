import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { AnnouncementResponseDto } from '../../dto/response/announcement-response.dto';
import { AnnouncementPublicReaderPort } from '../ports/announcement-public-reader.port';
import { AnnouncementResponseMapperService } from '../../domain/services/announcement-response-mapper.service';

@Injectable()
export class GetAnnouncementByIdUseCase {
    constructor(
        private readonly announcementPublicReaderPort: AnnouncementPublicReaderPort,
        private readonly announcementResponseMapperService: AnnouncementResponseMapperService,
    ) {}

    async execute(announcementId: string): Promise<AnnouncementResponseDto> {
        if (!Types.ObjectId.isValid(announcementId)) {
            throw new BadRequestException('올바르지 않은 공지사항 ID입니다.');
        }

        const announcement = await this.announcementPublicReaderPort.findActiveAnnouncementById(announcementId);

        if (!announcement) {
            throw new BadRequestException('공지사항을 찾을 수 없습니다.');
        }

        return this.announcementResponseMapperService.toResponse(announcement);
    }
}
