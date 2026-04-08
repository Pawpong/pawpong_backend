import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { AnnouncementPublicItem } from '../../application/ports/announcement-public-reader.port';
import { AnnouncementCreateRequestDto } from '../../dto/request/announcement-create-request.dto';
import { AnnouncementUpdateRequestDto } from '../../dto/request/announcement-update-request.dto';
import { AnnouncementWriterPort } from '../application/ports/announcement-writer.port';
import { AnnouncementRepository } from '../../repository/announcement.repository';

@Injectable()
export class AnnouncementMongooseWriterAdapter implements AnnouncementWriterPort {
    constructor(private readonly announcementRepository: AnnouncementRepository) {}

    async create(createData: AnnouncementCreateRequestDto): Promise<AnnouncementPublicItem> {
        const announcement = await this.announcementRepository.create(createData);
        return this.toItem(announcement);
    }

    async update(
        announcementId: string,
        updateData: AnnouncementUpdateRequestDto,
    ): Promise<AnnouncementPublicItem | null> {
        if (!Types.ObjectId.isValid(announcementId)) {
            return null;
        }

        const announcement = await this.announcementRepository.update(announcementId, updateData);
        if (!announcement) {
            return null;
        }
        return this.toItem(announcement);
    }

    async delete(announcementId: string): Promise<boolean> {
        return this.announcementRepository.deleteById(announcementId);
    }

    private toItem(announcement: any): AnnouncementPublicItem {
        return {
            announcementId: announcement._id.toString(),
            title: announcement.title,
            content: announcement.content,
            isActive: announcement.isActive,
            order: announcement.order,
            createdAt: announcement.createdAt,
            updatedAt: announcement.updatedAt,
        };
    }
}
