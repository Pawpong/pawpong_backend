import { Inject, Injectable } from '@nestjs/common';

import {
    AI_IMAGE_FILTER_READER_PORT,
    type AiImageFilterReaderPort,
} from '../../../shared/application/ports/ai-image-filter-reader.port';
import { AiImageFilterResultMapperService } from '../../domain/services/ai-image-filter-result-mapper.service';
import type { AiImageFilterResult } from '../types/ai-image-filter-result.type';

/** GET v2/ai-image/filters — 사용자가 고를 수 있는 활성 필터 목록 */
@Injectable()
export class GetActiveAiImageFiltersUseCase {
    constructor(
        @Inject(AI_IMAGE_FILTER_READER_PORT)
        private readonly filterReader: AiImageFilterReaderPort,
        private readonly mapper: AiImageFilterResultMapperService,
    ) {}

    async execute(): Promise<AiImageFilterResult[]> {
        const filters = await this.filterReader.findActive();
        return filters.map((filter) => this.mapper.toResult(filter));
    }
}
