import { Injectable } from '@nestjs/common';

import { BreederPaginationAssemblerService } from './breeder-pagination-assembler.service';

@Injectable()
export class BreederPublicReviewResponseMapperService {
    constructor(private readonly breederPaginationAssemblerService: BreederPaginationAssemblerService) {}

    toPaginationResponse(reviews: any[], total: number, page: number, limit: number) {
        const formattedReviews = reviews.map((review: any) => ({
            reviewId: review._id.toString(),
            applicationId: review.applicationId?._id?.toString() || review.applicationId?.toString(),
            adopterName: review.adopterId?.nickname || '알 수 없음',
            petName: review.applicationId?.petName || undefined,
            content: review.content,
            writtenAt: review.writtenAt,
            type: review.type,
            replyContent: review.replyContent || null,
            replyWrittenAt: review.replyWrittenAt || null,
            replyUpdatedAt: review.replyUpdatedAt || null,
        }));

        return this.breederPaginationAssemblerService.build(formattedReviews, page, limit, total);
    }
}
