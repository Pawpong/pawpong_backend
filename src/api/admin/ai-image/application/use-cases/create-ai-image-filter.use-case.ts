import { Inject, Injectable } from '@nestjs/common';

import { AI_IMAGE_ADMIN_FILTER_WRITER_PORT, type AiImageAdminFilterWriterPort } from '../ports/ai-image-admin-filter-writer.port';
import { AiImageAdminFilterResultMapperService } from '../../domain/services/ai-image-admin-filter-result-mapper.service';
import type { AiImageFilterCreateCommand } from '../types/ai-image-admin-filter-command.type';
import type { AiImageAdminFilterResult } from '../types/ai-image-admin-filter-result.type';

/** POST ai-image-admin/filter */
@Injectable()
export class CreateAiImageFilterUseCase {
    constructor(
        @Inject(AI_IMAGE_ADMIN_FILTER_WRITER_PORT)
        private readonly filterWriter: AiImageAdminFilterWriterPort,
        private readonly mapper: AiImageAdminFilterResultMapperService,
    ) {}

    async execute(data: AiImageFilterCreateCommand): Promise<AiImageAdminFilterResult> {
        const filter = await this.filterWriter.create(data);
        return this.mapper.toResult(filter);
    }
}
