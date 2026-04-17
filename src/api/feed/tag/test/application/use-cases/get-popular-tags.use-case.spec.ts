import { GetPopularTagsUseCase } from '../../../application/use-cases/get-popular-tags.use-case';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';
import { FeedTagReaderPort } from '../../../application/ports/feed-tag-reader.port';

function makeReader(tags: any[] = []): FeedTagReaderPort {
    return {
        readByTag: jest.fn(),
        countByTag: jest.fn(),
        readPopularTags: jest.fn().mockResolvedValue(tags),
        suggestTags: jest.fn(),
    };
}

function makeCache(cachedValue: any = null) {
    return {
        get: jest.fn().mockResolvedValue(cachedValue),
        set: jest.fn().mockResolvedValue(undefined),
        del: jest.fn(),
    };
}

describe('인기 태그 조회 유스케이스', () => {
    const cacheKeyService = new FeedCacheKeyService();

    it('캐시가 없으면 DB에서 조회하고 결과를 반환한다', async () => {
        const tags = [{ tag: '강아지', videoCount: 50, totalViews: 1000 }];
        const useCase = new GetPopularTagsUseCase(makeReader(tags), makeCache(null) as any, cacheKeyService);

        const result = await useCase.execute();

        expect(result).toHaveLength(1);
        expect(result[0].tag).toBe('강아지');
    });

    it('캐시가 있으면 캐시 데이터를 반환한다', async () => {
        const cached = [{ tag: '고양이', videoCount: 30, totalViews: 600 }];
        const reader = makeReader([]);
        const useCase = new GetPopularTagsUseCase(reader, makeCache(cached) as any, cacheKeyService);

        const result = await useCase.execute();

        expect(result).toEqual(cached);
        expect(reader.readPopularTags).not.toHaveBeenCalled();
    });

    it('태그가 없으면 빈 배열을 반환한다', async () => {
        const useCase = new GetPopularTagsUseCase(makeReader([]), makeCache(null) as any, cacheKeyService);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });
});
