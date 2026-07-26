import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AI_IMAGE_ADMIN_FILTER_WRITER_PORT, type AiImageAdminFilterWriterPort } from '../ports/ai-image-admin-filter-writer.port';
import { AI_IMAGE_RESPONSE_MESSAGES } from '../../../../service/ai-image/constants/ai-image-response-messages';

/** DELETE ai-image-admin/filter/:filterId */
@Injectable()
export class DeleteAiImageFilterUseCase {
    constructor(
        @Inject(AI_IMAGE_ADMIN_FILTER_WRITER_PORT)
        private readonly filterWriter: AiImageAdminFilterWriterPort,
    ) {}

    async execute(filterId: string): Promise<{ filterId: string; deleted: boolean }> {
        const deleted = await this.filterWriter.delete(filterId);
        if (!deleted) {
            throw new BadRequestException(AI_IMAGE_RESPONSE_MESSAGES.filterNotFound);
        }
        return { filterId, deleted };
    }
}
