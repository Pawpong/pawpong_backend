import { Injectable } from '@nestjs/common';
import { FeedTagRepository } from '../repository/feed-tag.repository';
import {
    FeedPopularTagSnapshot,
    FeedTagReaderPort,
    FeedTagSuggestionSnapshot,
    FeedTagVideoSnapshot,
} from '../application/ports/feed-tag-reader.port';
import type { FeedUploaderDocumentRecord, FeedVideoDocumentRecord } from '../../types/feed-document.type';

@Injectable()
export class FeedTagMongooseReaderAdapter implements FeedTagReaderPort {
    constructor(private readonly feedTagRepository: FeedTagRepository) {}

    async readByTag(tag: string, skip: number, limit: number): Promise<FeedTagVideoSnapshot[]> {
        const exactTagPattern = new RegExp(`^${this.escapeRegex(tag)}$`, 'i');
        const videos = await this.feedTagRepository.findReadyPublicByExactTag(exactTagPattern, skip, limit);

        return videos.map((video) => this.toVideoSnapshot(video));
    }

    countByTag(tag: string): Promise<number> {
        const exactTagPattern = new RegExp(`^${this.escapeRegex(tag)}$`, 'i');
        return this.feedTagRepository.countReadyPublicByExactTag(exactTagPattern);
    }

    async readPopularTags(limit: number): Promise<FeedPopularTagSnapshot[]> {
        const popularTags = await this.feedTagRepository.aggregatePopularTags(limit);

        return popularTags.map((tag) => ({
            tag: tag.tag,
            videoCount: tag.videoCount,
            totalViews: tag.totalViews,
        }));
    }

    async suggestTags(query: string, limit: number): Promise<FeedTagSuggestionSnapshot[]> {
        const queryPattern = new RegExp(`^${this.escapeRegex(query)}`, 'i');
        const suggestions = await this.feedTagRepository.aggregateTagSuggestions(queryPattern, limit);

        return suggestions.map((tag) => ({
            tag: tag.tag,
            videoCount: tag.videoCount,
        }));
    }

    private toVideoSnapshot(video: FeedVideoDocumentRecord): FeedTagVideoSnapshot {
        const uploader =
            video.uploadedBy && typeof video.uploadedBy === 'object' && '_id' in video.uploadedBy
                ? video.uploadedBy
                : null;

        return {
            id: video._id.toString(),
            title: video.title,
            thumbnailKey: video.thumbnailKey,
            duration: video.duration,
            viewCount: video.viewCount,
            likeCount: video.likeCount,
            tags: video.tags || [],
            uploadedBy: uploader
                ? {
                      id: uploader._id.toString(),
                      name: uploader.name,
                      profileImageFileName: uploader.profileImageFileName,
                      businessName: uploader.businessName,
                  }
                : null,
            createdAt: video.createdAt,
        };
    }

    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
