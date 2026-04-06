import { AnnouncementPublicItem } from '../../../application/ports/announcement-public-reader.port';
import { AnnouncementCreateRequestDto } from '../../../dto/request/announcement-create-request.dto';
import { AnnouncementUpdateRequestDto } from '../../../dto/request/announcement-update-request.dto';

export const ANNOUNCEMENT_WRITER = Symbol('ANNOUNCEMENT_WRITER');

export interface AnnouncementWriterPort {
    create(createData: AnnouncementCreateRequestDto): Promise<AnnouncementPublicItem>;
    update(announcementId: string, updateData: AnnouncementUpdateRequestDto): Promise<AnnouncementPublicItem | null>;
    delete(announcementId: string): Promise<boolean>;
}
