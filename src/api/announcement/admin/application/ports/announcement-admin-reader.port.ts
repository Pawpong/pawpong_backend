import { AnnouncementPublicListQuery, AnnouncementPublicListResult } from '../../../application/ports/announcement-public-reader.port';

export abstract class AnnouncementAdminReaderPort {
    abstract findAllAnnouncements(query: AnnouncementPublicListQuery): Promise<AnnouncementPublicListResult>;
}
