import type {
    FeedPopularTagResult,
    FeedTagSearchResult,
    FeedTagSuggestionResult,
} from '../types/feed-tag-result.type';

export interface SearchFeedVideosByTagUseCasePort {
    execute(tag: string, page?: number, limit?: number): Promise<FeedTagSearchResult>;
}

export interface GetPopularFeedTagsUseCasePort {
    execute(limit?: number): Promise<FeedPopularTagResult[]>;
}

export interface SuggestFeedTagsUseCasePort {
    execute(query: string, limit?: number): Promise<FeedTagSuggestionResult[]>;
}
