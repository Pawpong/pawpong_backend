import { NoticeItemMapperService } from '../../../domain/services/notice-item-mapper.service';
import { NoticeSnapshot } from '../../../application/ports/notice-reader.port';

describe('NoticeItemMapperService', () => {
    const service = new NoticeItemMapperService();

    function makeSnapshot(overrides: Partial<NoticeSnapshot> = {}): NoticeSnapshot {
        return {
            id: 'notice-1',
            title: '제목',
            content: '내용',
            authorName: '관리자',
            status: 'published',
            isPinned: false,
            viewCount: 10,
            publishedAt: new Date('2026-01-01T00:00:00.000Z'),
            expiredAt: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-02T00:00:00.000Z'),
            ...overrides,
        };
    }

    it('공지 스냅샷을 item 결과로 매핑한다', () => {
        const result = service.toItem(makeSnapshot());
        expect(result.noticeId).toBe('notice-1');
        expect(result.publishedAt).toBe('2026-01-01T00:00:00.000Z');
        expect(result.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });

    it('viewCount가 undefined면 0으로 대체한다', () => {
        const result = service.toItem(makeSnapshot({ viewCount: undefined as any }));
        expect(result.viewCount).toBe(0);
    });

    it('publishedAt/expiredAt이 null이면 undefined를 반환한다', () => {
        const result = service.toItem(makeSnapshot({ publishedAt: null, expiredAt: null }));
        expect(result.publishedAt).toBeUndefined();
        expect(result.expiredAt).toBeUndefined();
    });
});
