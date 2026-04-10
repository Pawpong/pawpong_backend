import type {
    FeedPopularTagResult,
    FeedTagSearchResult,
    FeedTagSuggestionResult,
} from '../types/feed-tag-result.type';

export const SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE = Symbol('SEARCH_FEED_VIDEOS_BY_TAG_USE_CASE');
export const GET_POPULAR_FEED_TAGS_USE_CASE = Symbol('GET_POPULAR_FEED_TAGS_USE_CASE');
export const SUGGEST_FEED_TAGS_USE_CASE = Symbol('SUGGEST_FEED_TAGS_USE_CASE');

export interface SearchFeedVideosByTagUseCasePort {
    execute(tag: string, page?: number, limit?: number): Promise<FeedTagSearchResult>;
}

export interface GetPopularFeedTagsUseCasePort {
    execute(limit?: number): Promise<FeedPopularTagResult[]>;
}

export interface SuggestFeedTagsUseCasePort {
    execute(query: string, limit?: number): Promise<FeedTagSuggestionResult[]>;
}
