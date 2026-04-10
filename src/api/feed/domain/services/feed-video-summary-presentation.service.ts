import { Injectable } from '@nestjs/common';
import type { FeedVideoUploaderResult } from '../../video/application/types/feed-video-result.type';

type FeedUploaderSummarySnapshot = {
    id: string;
    name?: string;
    profileImageFileName?: string;
    businessName?: string;
};

@Injectable()
export class FeedVideoSummaryPresentationService {
    toUploaderResponse(uploader: FeedUploaderSummarySnapshot | null): FeedVideoUploaderResult | null {
        if (!uploader) {
            return null;
        }

        return {
            _id: uploader.id,
            name: uploader.name,
            profileImageFileName: uploader.profileImageFileName,
            businessName: uploader.businessName,
        };
    }

    toPagination(page: number, limit: number, totalCount: number) {
        const totalPages = Math.ceil(totalCount / limit);

        return {
            currentPage: page,
            pageSize: limit,
            totalItems: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
    }
}
