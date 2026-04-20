import { NoticePageAssemblerService } from '../../../domain/services/notice-page-assembler.service';
import { NoticeItemMapperService } from '../../../domain/services/notice-item-mapper.service';
import { NoticePaginationAssemblerService } from '../../../domain/services/notice-pagination-assembler.service';
import { NoticeSnapshot } from '../../../application/ports/notice-reader.port';

function makeSnapshot(id: string): NoticeSnapshot {
    return {
        id,
        title: '제목',
        content: '내용',
        authorName: '관리자',
        status: 'published',
        isPinned: false,
        viewCount: 0,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
}

describe('NoticePageAssemblerService', () => {
    const service = new NoticePageAssemblerService(new NoticeItemMapperService(), new NoticePaginationAssemblerService());

    it('snapshot 배열을 매핑하여 페이지네이션 구조로 반환한다', () => {
        const result = service.build([makeSnapshot('n-1'), makeSnapshot('n-2')], 1, 10, 2);
        expect(result.items).toHaveLength(2);
        expect(result.items[0].noticeId).toBe('n-1');
        expect(result.pagination.totalItems).toBe(2);
    });

    it('빈 배열도 처리한다', () => {
        const result = service.build([], 1, 10, 0);
        expect(result.items).toEqual([]);
    });
});
