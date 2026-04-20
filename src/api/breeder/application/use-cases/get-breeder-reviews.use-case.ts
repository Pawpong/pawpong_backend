import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import { BreederPublicReviewPageAssemblerService } from '../../domain/services/breeder-public-review-page-assembler.service';

@Injectable()
export class GetBreederReviewsUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        private readonly breederPublicReviewPageAssemblerService: BreederPublicReviewPageAssemblerService,
    ) {}

    async execute(breederId: string, page: number = 1, limit: number = 10) {
        const breeder = await this.breederPublicReaderPort.findPublicBreederById(breederId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더를 찾을 수 없습니다.');
        }

        const { reviews, total } = await this.breederPublicReaderPort.findVisibleBreederReviewsByBreederId(
            breederId,
            page,
            limit,
        );

        return this.breederPublicReviewPageAssemblerService.build(reviews, total, page, limit);
    }
}
