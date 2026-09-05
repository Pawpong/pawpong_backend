import {
    AnnouncementPublicListQuery,
    AnnouncementPublicListResult,
} from '../../../../service/announcement/application/ports/announcement-public-reader.port';

export const ANNOUNCEMENT_ADMIN_READER_PORT = Symbol('ANNOUNCEMENT_ADMIN_READER_PORT');

export interface AnnouncementAdminReaderPort {
    findAllAnnouncements(query: AnnouncementPublicListQuery): Promise<AnnouncementPublicListResult>;
}
