import { AnnouncementItemMapperService } from '../../../domain/services/announcement-item-mapper.service';
import { AnnouncementPublicItem } from '../../../application/ports/announcement-public-reader.port';

describe('AnnouncementItemMapperService', () => {
    const service = new AnnouncementItemMapperService();

    it('공지 아이템을 result로 1:1 매핑한다', () => {
        const item: AnnouncementPublicItem = {
            announcementId: 'a-1',
            title: '제목',
            content: '내용',
            isActive: true,
            order: 1,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        };
        expect(service.toItem(item)).toEqual(item);
    });
});
