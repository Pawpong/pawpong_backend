import { PopularTagItemDto, TagSearchResponseDto, TagSuggestionItemDto } from '../../dto/response/tag-response.dto';

export const SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE = Symbol('SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE');
export const GET_POPULAR_FEED_TAGS_USE_CASE = Symbol('GET_POPULAR_FEED_TAGS_USE_CASE');
export const SUGGEST_FEED_TAGS_USE_CASE = Symbol('SUGGEST_FEED_TAGS_USE_CASE');

export interface SearchFeedVideosByTagUseCasePort {
    execute(tag: string, page?: number, limit?: number): Promise<TagSearchResponseDto>;
}

export interface GetPopularFeedTagsUseCasePort {
    execute(limit?: number): Promise<PopularTagItemDto[]>;
}

export interface SuggestFeedTagsUseCasePort {
    execute(query: string, limit?: number): Promise<TagSuggestionItemDto[]>;
}
