import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { FeedCacheKeyService } from '../../../../domain/services/feed-cache-key.service';
import { SearchByTagUseCase } from '../../../../tag/application/use-cases/search-by-tag.use-case';
import type { FeedTagAssetUrlPort } from '../../../../tag/application/ports/feed-tag-asset-url.port';
import type { FeedTagReaderPort } from '../../../../tag/application/ports/feed-tag-reader.port';
import type { FeedTagSearchResult } from '../../../../tag/application/types/feed-tag-result.type';
import { FeedTagSearchResultAssemblerService } from '../../../../tag/domain/services/feed-tag-search-result-assembler.service';
import { FeedTagNormalizerService } from '../../../../tag/domain/services/feed-tag-normalizer.service';

describe('SearchByTagUseCase', () => {
    const createCache = () => ({
        get: jest.fn(),
        set: jest.fn(),
    });

    it('빈 태그 입력이면 DomainValidationError를 던진다', async () => {
        const feedTagReader: jest.Mocked<FeedTagReaderPort> = {
            readByTag: jest.fn(),
            countByTag: jest.fn(),
            readPopularTags: jest.fn(),
            suggestTags: jest.fn(),
        };
        const assembler = {
            buildSearchResponse: jest.fn(),
        } as unknown as jest.Mocked<FeedTagSearchResultAssemblerService>;
        const feedTagAssetUrl: jest.Mocked<FeedTagAssetUrlPort> = {
            generateSignedUrl: jest.fn(),
        };
        const cache = createCache();
        const useCase = new SearchByTagUseCase(
            feedTagReader,
            new FeedTagNormalizerService(),
            assembler,
            feedTagAssetUrl,
            cache as never,
            new FeedCacheKeyService(),
        );

        await expect(useCase.execute('   ')).rejects.toThrow(DomainValidationError);
        expect(feedTagReader.readByTag).not.toHaveBeenCalled();
        expect(cache.get).not.toHaveBeenCalled();
    });

    it('정상 조회면 결과를 캐시에 저장하고 반환한다', async () => {
        const createdAt = new Date('2026-04-15T00:00:00.000Z');
        const feedTagReader: jest.Mocked<FeedTagReaderPort> = {
            readByTag: jest.fn().mockResolvedValue([
                {
                    id: 'video-1',
                    title: '귀여운 강아지',
                    thumbnailKey: 'thumbnail.jpg',
                    duration: 30,
                    viewCount: 100,
                    likeCount: 10,
                    tags: ['dog'],
                    uploadedBy: {
                        id: 'breeder-1',
                        name: '브리더',
                    },
                    createdAt,
                },
            ]),
            countByTag: jest.fn().mockResolvedValue(1),
            readPopularTags: jest.fn(),
            suggestTags: jest.fn(),
        };
        const expected: FeedTagSearchResult = {
            tag: 'dog',
            videos: [
                {
                    videoId: 'video-1',
                    title: '귀여운 강아지',
                    thumbnailUrl: 'https://cdn.example.com/thumbnail.jpg',
                    duration: 30,
                    viewCount: 100,
                    likeCount: 10,
                    tags: ['dog'],
                    uploadedBy: {
                        _id: 'breeder-1',
                        name: '브리더',
                    },
                    createdAt,
                },
            ],
            pagination: {
                currentPage: 2,
                pageSize: 10,
                totalPages: 1,
                totalItems: 1,
                hasNextPage: false,
                hasPrevPage: true,
            },
        };
        const assembler = {
            buildSearchResponse: jest.fn().mockResolvedValue(expected),
        } as unknown as jest.Mocked<FeedTagSearchResultAssemblerService>;
        const feedTagAssetUrl: jest.Mocked<FeedTagAssetUrlPort> = {
            generateSignedUrl: jest.fn().mockReturnValue('https://cdn.example.com/thumbnail.jpg'),
        };
        const cache = createCache();
        cache.get.mockResolvedValue(undefined);
        const useCase = new SearchByTagUseCase(
            feedTagReader,
            new FeedTagNormalizerService(),
            assembler,
            feedTagAssetUrl,
            cache as never,
            new FeedCacheKeyService(),
        );

        await expect(useCase.execute(' #Dog ', 2, 10)).resolves.toEqual(expected);
        expect(cache.get).toHaveBeenCalledWith('video:tag:dog:2:10');
        expect(feedTagReader.readByTag).toHaveBeenCalledWith('dog', 10, 10);
        expect(feedTagReader.countByTag).toHaveBeenCalledWith('dog');
        expect(assembler.buildSearchResponse).toHaveBeenCalledTimes(1);
        expect(cache.set).toHaveBeenCalledWith('video:tag:dog:2:10', expected, 300000);
    });
});
