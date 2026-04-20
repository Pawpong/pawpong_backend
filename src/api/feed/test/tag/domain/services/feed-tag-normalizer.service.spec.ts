import { FeedTagNormalizerService } from '../../../../tag/domain/services/feed-tag-normalizer.service';

describe('피드 태그 정규화 서비스', () => {
    it('태그 앞의 #을 제거하고 소문자로 정규화한다', () => {
        const service = new FeedTagNormalizerService();

        expect(service.normalizeTag('#PawPong')).toBe('pawpong');
        expect(service.normalizeTag('  #DogLife  ')).toBe('doglife');
    });
});
