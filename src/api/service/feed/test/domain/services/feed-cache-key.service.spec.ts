import { FeedCacheKeyService } from '../../../domain/services/feed-cache-key.service';

describe('FeedCacheKeyService', () => {
    const service = new FeedCacheKeyService();

    it('getVideoMetaKey는 videoId를 포함한 키를 반환한다', () => {
        expect(service.getVideoMetaKey('video-1')).toBe('video:meta:video-1');
    });

    it('getVideoCommentsKey는 videoId를 포함한 키를 반환한다', () => {
        expect(service.getVideoCommentsKey('video-1')).toBe('video:comments:video-1');
    });

    it('getFeedKey는 page와 limit을 포함한다', () => {
        expect(service.getFeedKey(1, 20)).toBe('video:feed:1:20');
    });

    it('getPopularVideosKey는 limit을 포함한다', () => {
        expect(service.getPopularVideosKey(10)).toBe('video:popular:10');
    });

    it('getPopularTagsKey는 limit을 포함한다', () => {
        expect(service.getPopularTagsKey(10)).toBe('video:popular-tags:10');
    });

    it('getTagSearchKey는 tag, page, limit을 모두 포함한다', () => {
        expect(service.getTagSearchKey('강아지', 2, 15)).toBe('video:tag:강아지:2:15');
    });

    it('getSignedUrlKey는 fileKey를 포함한다', () => {
        expect(service.getSignedUrlKey('videos/raw/video-1.mp4')).toBe('signed-url:videos/raw/video-1.mp4');
    });
});
