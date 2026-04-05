import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import { BreederPublicReviewResponseMapperService } from '../../domain/services/breeder-public-review-response-mapper.service';

@Injectable()
export class GetBreederReviewsUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        private readonly breederPublicReviewResponseMapperService: BreederPublicReviewResponseMapperService,
    ) {}

    async execute(breederId: string, page: number = 1, limit: number = 10) {
        if (!Types.ObjectId.isValid(breederId)) {
            throw new BadRequestException('올바르지 않은 브리더 ID 형식입니다.');
        }

        const breeder = await this.breederPublicReaderPort.findPublicBreederById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        const { reviews, total } = await this.breederPublicReaderPort.findVisibleBreederReviewsByBreederId(
            breederId,
            page,
            limit,
        );

        return this.breederPublicReviewResponseMapperService.toPaginationResponse(reviews, total, page, limit);
    }
}
