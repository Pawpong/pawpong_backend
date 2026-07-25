import { Inject, Injectable } from '@nestjs/common';

import { AI_IMAGE_FILTER_READER_PORT, type AiImageFilterReaderPort } from '../../../shared/application/ports/ai-image-filter-reader.port';
import { AiImageAdminFilterResultMapperService } from '../../domain/services/ai-image-admin-filter-result-mapper.service';
import type { AiImageAdminFilterResult } from '../types/ai-image-admin-filter-result.type';

/** GET ai-image-admin/filters — 비활성 포함 전체 목록 */
@Injectable()
export class GetAllAiImageFiltersUseCase {
    constructor(
        @Inject(AI_IMAGE_FILTER_READER_PORT)
        private readonly filterReader: AiImageFilterReaderPort,
        private readonly mapper: AiImageAdminFilterResultMapperService,
    ) {}

    async execute(): Promise<AiImageAdminFilterResult[]> {
        const filters = await this.filterReader.findAll();
        return filters.map((filter) => this.mapper.toResult(filter));
    }
}
