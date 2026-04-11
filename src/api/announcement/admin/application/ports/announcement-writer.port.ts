import { AnnouncementPublicItem } from '../../../application/ports/announcement-public-reader.port';
import type { AnnouncementCreateCommand, AnnouncementUpdateCommand } from '../types/announcement-command.type';

export const ANNOUNCEMENT_WRITER_PORT = Symbol('ANNOUNCEMENT_WRITER_PORT');

export interface AnnouncementWriterPort {
    create(createData: AnnouncementCreateCommand): Promise<AnnouncementPublicItem>;
    update(announcementId: string, updateData: AnnouncementUpdateCommand): Promise<AnnouncementPublicItem | null>;
    delete(announcementId: string): Promise<boolean>;
}
