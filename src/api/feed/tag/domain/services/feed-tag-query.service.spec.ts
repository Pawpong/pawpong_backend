import { FeedTagQueryService } from './feed-tag-query.service';

describe('FeedTagQueryService', () => {
    it('태그 앞의 #을 제거하고 소문자로 정규화한다', () => {
        const service = new FeedTagQueryService();

        expect(service.normalizeTag('#PawPong')).toBe('pawpong');
        expect(service.normalizeTag('  #DogLife  ')).toBe('doglife');
    });
});
