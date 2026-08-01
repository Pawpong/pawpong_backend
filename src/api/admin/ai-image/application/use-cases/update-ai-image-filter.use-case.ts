import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AI_IMAGE_ADMIN_FILTER_WRITER_PORT, type AiImageAdminFilterWriterPort } from '../ports/ai-image-admin-filter-writer.port';
import { AiImageAdminFilterResultMapperService } from '../../domain/services/ai-image-admin-filter-result-mapper.service';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../../../service/ai-image/constants/ai-image-response-messages';
import type { AiImageFilterUpdateCommand } from '../types/ai-image-admin-filter-command.type';
import type { AiImageAdminFilterResult } from '../types/ai-image-admin-filter-result.type';

/** PATCH ai-image-admin/filter/:filterId */
@Injectable()
export class UpdateAiImageFilterUseCase {
    constructor(
        @Inject(AI_IMAGE_ADMIN_FILTER_WRITER_PORT)
        private readonly filterWriter: AiImageAdminFilterWriterPort,
        private readonly mapper: AiImageAdminFilterResultMapperService,
    ) {}

    async execute(filterId: string, data: AiImageFilterUpdateCommand): Promise<AiImageAdminFilterResult> {
        const filter = await this.filterWriter.update(filterId, data);
        if (!filter) {
            throw new BadRequestException(AI_IMAGE_RESPONSE_MESSAGES.filterNotFound);
        }
        return this.mapper.toResult(filter);
    }
}
