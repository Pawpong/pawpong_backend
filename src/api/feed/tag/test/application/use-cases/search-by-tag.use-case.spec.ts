import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { SearchByTagUseCase } from '../../../application/use-cases/search-by-tag.use-case';
import { FeedTagNormalizerService } from '../../../domain/services/feed-tag-normalizer.service';
import { FeedTagSearchResultAssemblerService } from '../../../domain/services/feed-tag-search-result-assembler.service';
import { FeedVideoSummaryMapperService } from '../../../../domain/services/feed-video-summary-mapper.service';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';
import { FeedTagReaderPort, FeedTagVideoSnapshot } from '../../../application/ports/feed-tag-reader.port';

function makeVideoSnapshot(overrides: Partial<FeedTagVideoSnapshot> = {}): FeedTagVideoSnapshot {
    return {
        id: 'video-1',
        title: '강아지 영상',
        thumbnailKey: 'thumb/video-1.jpg',
        duration: 90,
        viewCount: 200,
        likeCount: 30,
        tags: ['강아지'],
        uploadedBy: { id: 'user-1', name: '브리더A' },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

function makeReader(videos: FeedTagVideoSnapshot[] = [], total = 0): FeedTagReaderPort {
    return {
        readByTag: jest.fn().mockResolvedValue(videos),
        countByTag: jest.fn().mockResolvedValue(total),
        readPopularTags: jest.fn(),
        suggestTags: jest.fn(),
    };
}

function makeAssetUrl() {
    return {
        generateSignedUrl: jest.fn().mockReturnValue('https://cdn.example.com/thumb.jpg'),
    };
}

function makeCache(cachedValue: any = null) {
    return {
        get: jest.fn().mockResolvedValue(cachedValue),
        set: jest.fn().mockResolvedValue(undefined),
        del: jest.fn(),
    };
}

describe('태그로 영상 검색 유스케이스', () => {
    const normalizerService = new FeedTagNormalizerService();
    const assemblerService = new FeedTagSearchResultAssemblerService(new FeedVideoSummaryMapperService());
    const cacheKeyService = new FeedCacheKeyService();

    it('태그로 영상 목록을 반환한다', async () => {
        const useCase = new SearchByTagUseCase(
            makeReader([makeVideoSnapshot()], 1),
            normalizerService,
            assemblerService,
            makeAssetUrl() as any,
            makeCache() as any,
            cacheKeyService,
        );

        const result = await useCase.execute('강아지');

        expect(result.videos).toHaveLength(1);
        expect(result.tag).toBe('강아지');
    });

    it('빈 태그를 입력하면 DomainValidationError를 던진다', async () => {
        const useCase = new SearchByTagUseCase(
            makeReader(),
            normalizerService,
            assemblerService,
            makeAssetUrl() as any,
            makeCache() as any,
            cacheKeyService,
        );

        await expect(useCase.execute('')).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('# 접두사를 제거하고 검색한다', async () => {
        const reader = makeReader([makeVideoSnapshot()], 1);
        const useCase = new SearchByTagUseCase(
            reader,
            normalizerService,
            assemblerService,
            makeAssetUrl() as any,
            makeCache() as any,
            cacheKeyService,
        );

        await useCase.execute('#강아지');

        expect(reader.readByTag).toHaveBeenCalledWith('강아지', 0, 20);
    });

    it('캐시가 있으면 DB를 조회하지 않는다', async () => {
        const cached = { videos: [], tag: '강아지', pagination: {} };
        const reader = makeReader();
        const useCase = new SearchByTagUseCase(
            reader,
            normalizerService,
            assemblerService,
            makeAssetUrl() as any,
            makeCache(cached) as any,
            cacheKeyService,
        );

        const result = await useCase.execute('강아지');

        expect(result).toEqual(cached);
        expect(reader.readByTag).not.toHaveBeenCalled();
    });
});
