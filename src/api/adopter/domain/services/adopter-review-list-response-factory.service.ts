import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import type { AdopterReviewListRecord } from '../../application/ports/adopter-review-reader.port';
import { MyReviewItemDto } from '../../dto/response/my-review-item.dto';

@Injectable()
export class AdopterReviewListResponseFactoryService {
    create(
        reviews: AdopterReviewListRecord[],
        page: number,
        limit: number,
        total: number,
    ): PaginationResponseDto<MyReviewItemDto> {
        const items = reviews.map((review) => this.toItem(review));

        return new PaginationBuilder<MyReviewItemDto>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(total)
            .build();
    }

    private toItem(review: AdopterReviewListRecord): MyReviewItemDto {
        return {
            reviewId: review.reviewId,
            applicationId: review.applicationId,
            breederId: review.breederId,
            breederNickname: review.breederNickname || '알 수 없음',
            breederProfileImage: review.breederProfileImageFileName,
            breederLevel: review.breederLevel || 'new',
            breedingPetType: review.breedingPetType || 'unknown',
            content: review.content,
            reviewType: review.reviewType,
            writtenAt: review.writtenAt,
        } as MyReviewItemDto & { applicationId: string | null; breederId: string | null };
    }
}
