import { FeedTagQueryService } from '../../../../tag/domain/services/feed-tag-query.service';

describe('피드 태그 조회 서비스', () => {
    it('태그 앞의 #을 제거하고 소문자로 정규화한다', () => {
        const service = new FeedTagQueryService();

        expect(service.normalizeTag('#PawPong')).toBe('pawpong');
        expect(service.normalizeTag('  #DogLife  ')).toBe('doglife');
    });
});
