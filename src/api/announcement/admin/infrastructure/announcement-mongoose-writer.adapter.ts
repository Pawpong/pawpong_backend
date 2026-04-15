import { Injectable } from '@nestjs/common';

import { AnnouncementDocument } from '../../../../schema/announcement.schema';
import { isMongoObjectId } from '../../../../common/utils/mongo-object-id.util';
import { AnnouncementPublicItem } from '../../application/ports/announcement-public-reader.port';
import { AnnouncementWriterPort } from '../application/ports/announcement-writer.port';
import { AnnouncementRepository } from '../../repository/announcement.repository';
import type { AnnouncementCreateCommand, AnnouncementUpdateCommand } from '../application/types/announcement-command.type';

@Injectable()
export class AnnouncementMongooseWriterAdapter implements AnnouncementWriterPort {
    constructor(private readonly announcementRepository: AnnouncementRepository) {}

    async create(createData: AnnouncementCreateCommand): Promise<AnnouncementPublicItem> {
        const announcement = await this.announcementRepository.create(createData);
        return this.toItem(announcement);
    }

    async update(
        announcementId: string,
        updateData: AnnouncementUpdateCommand,
    ): Promise<AnnouncementPublicItem | null> {
        if (!isMongoObjectId(announcementId)) {
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

    private toItem(announcement: AnnouncementDocument): AnnouncementPublicItem {
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
