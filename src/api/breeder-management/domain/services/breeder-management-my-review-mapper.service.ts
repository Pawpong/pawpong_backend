import { Injectable } from '@nestjs/common';

import type { BreederManagementReviewRecord } from '../../application/ports/breeder-management-list-reader.port';

@Injectable()
export class BreederManagementMyReviewMapperService {
    toItem(review: BreederManagementReviewRecord) {
        return {
            reviewId: String(review._id),
            adopterId: review.adopterId?._id ? String(review.adopterId._id) : '',
            adopterName: review.adopterId?.name || review.adopterId?.nickname || '익명',
            petName: '',
            rating: 0,
            petHealthRating: undefined,
            communicationRating: undefined,
            content: review.content,
            photos: [],
            writtenAt: review.writtenAt,
            type: review.type || 'consultation',
            isVisible: review.isVisible,
            reportCount: review.isReported ? 1 : 0,
            replyContent: review.replyContent,
            replyWrittenAt: review.replyWrittenAt,
            replyUpdatedAt: review.replyUpdatedAt,
        };
    }
}
