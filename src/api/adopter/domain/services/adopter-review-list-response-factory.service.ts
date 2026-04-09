import { Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import type { AdopterReviewListRecord } from '../../application/ports/adopter-review-reader.port';
import { MyReviewItemDto } from '../../dto/response/my-review-item.dto';
import { AdopterPaginationAssemblerService } from './adopter-pagination-assembler.service';

@Injectable()
export class AdopterReviewListResponseFactoryService {
    constructor(private readonly adopterPaginationAssemblerService: AdopterPaginationAssemblerService) {}

    create(
        reviews: AdopterReviewListRecord[],
        page: number,
        limit: number,
        total: number,
    ): PaginationResponseDto<MyReviewItemDto> {
        const items = reviews.map((review) => this.toItem(review));

        return this.adopterPaginationAssemblerService.build(items, page, limit, total);
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
