import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { MyReviewsListResponseDto } from '../../dto/response/my-reviews-list-response.dto';
import {
    BREEDER_MANAGEMENT_LIST_READER_PORT,
    type BreederManagementListReaderPort,
} from '../ports/breeder-management-list-reader.port';
import { BreederManagementMyReviewMapperService } from '../../domain/services/breeder-management-my-review-mapper.service';
import { BreederManagementPaginationAssemblerService } from '../../domain/services/breeder-management-pagination-assembler.service';

@Injectable()
export class GetBreederManagementMyReviewsUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_LIST_READER_PORT)
        private readonly breederManagementListReaderPort: BreederManagementListReaderPort,
        private readonly breederManagementMyReviewMapperService: BreederManagementMyReviewMapperService,
        private readonly breederManagementPaginationAssemblerService: BreederManagementPaginationAssemblerService,
    ) {}

    async execute(
        userId: string,
        visibility: string = 'all',
        page: number = 1,
        limit: number = 10,
    ): Promise<MyReviewsListResponseDto> {
        const breeder = await this.breederManagementListReaderPort.findBreederSummary(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const snapshot = await this.breederManagementListReaderPort.findMyReviewsSnapshot(userId, visibility, page, limit);
        const items = snapshot.reviews.map((review) => this.breederManagementMyReviewMapperService.toItem(review));
        const paginationResponse = this.breederManagementPaginationAssemblerService.toPage(
            items,
            page,
            limit,
            snapshot.filteredTotal,
        );

        return Object.assign(paginationResponse, {
            averageRating: breeder.averageRating || 0,
            totalReviews: snapshot.totalCount,
            visibleReviews: snapshot.visibleCount,
            hiddenReviews: snapshot.hiddenCount,
        }) as MyReviewsListResponseDto;
    }
}
