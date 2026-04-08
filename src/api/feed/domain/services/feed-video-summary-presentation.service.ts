import { Injectable } from '@nestjs/common';

type FeedUploaderSummarySnapshot = {
    id: string;
    name?: string;
    profileImageFileName?: string;
    businessName?: string;
};

@Injectable()
export class FeedVideoSummaryPresentationService {
    toUploaderResponse(uploader: FeedUploaderSummarySnapshot | null): any {
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
