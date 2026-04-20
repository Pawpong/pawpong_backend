import { SuggestTagsUseCase } from '../../../application/use-cases/suggest-tags.use-case';
import { FeedTagNormalizerService } from '../../../domain/services/feed-tag-normalizer.service';
import { FeedTagReaderPort } from '../../../application/ports/feed-tag-reader.port';

function makeReader(suggestions: any[] = []): FeedTagReaderPort {
    return {
        readByTag: jest.fn(),
        countByTag: jest.fn(),
        readPopularTags: jest.fn(),
        suggestTags: jest.fn().mockResolvedValue(suggestions),
    };
}

describe('태그 자동 완성 유스케이스', () => {
    const normalizer = new FeedTagNormalizerService();

    it('쿼리에 맞는 태그 제안을 반환한다', async () => {
        const useCase = new SuggestTagsUseCase(
            makeReader([{ tag: '강아지', videoCount: 10 }, { tag: '강아지사랑', videoCount: 5 }]),
            normalizer,
        );

        const result = await useCase.execute('강아지');

        expect(result).toHaveLength(2);
    });

    it('빈 쿼리면 빈 배열을 반환한다', async () => {
        const reader = makeReader([{ tag: '강아지', videoCount: 1 }]);
        const useCase = new SuggestTagsUseCase(reader, normalizer);

        const result = await useCase.execute('');

        expect(result).toEqual([]);
        expect(reader.suggestTags).not.toHaveBeenCalled();
    });

    it('#이 포함된 쿼리는 정규화 후 검색한다', async () => {
        const reader = makeReader([]);
        const useCase = new SuggestTagsUseCase(reader, normalizer);

        await useCase.execute('#강아지');

        expect(reader.suggestTags).toHaveBeenCalledWith('강아지', 10);
    });

    it('공백만 있는 쿼리는 빈 배열을 반환한다', async () => {
        const reader = makeReader([]);
        const useCase = new SuggestTagsUseCase(reader, normalizer);

        const result = await useCase.execute('   ');

        expect(result).toEqual([]);
        expect(reader.suggestTags).not.toHaveBeenCalled();
    });
});
