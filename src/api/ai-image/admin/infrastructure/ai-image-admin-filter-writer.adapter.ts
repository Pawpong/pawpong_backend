import { Injectable } from '@nestjs/common';

import type { AiImageFilterDocument } from '../../../../schema/ai-image-filter.schema';
import type { AiImageFilterSnapshot } from '../../shared/application/types/ai-image-filter-snapshot.type';
import type { AiImageAdminFilterWriterPort } from '../application/ports/ai-image-admin-filter-writer.port';
import type { AiImageFilterCreateCommand, AiImageFilterUpdateCommand } from '../application/types/ai-image-admin-filter-command.type';
import { AiImageAdminFilterRepository } from '../repository/ai-image-admin-filter.repository';

@Injectable()
export class AiImageAdminFilterWriterAdapter implements AiImageAdminFilterWriterPort {
    constructor(private readonly repository: AiImageAdminFilterRepository) {}

    async create(data: AiImageFilterCreateCommand): Promise<AiImageFilterSnapshot> {
        const filter = await this.repository.create(data);
        return this.toSnapshot(filter);
    }

    async update(filterId: string, data: AiImageFilterUpdateCommand): Promise<AiImageFilterSnapshot | null> {
        const filter = await this.repository.update(filterId, data);
        return filter ? this.toSnapshot(filter) : null;
    }

    delete(filterId: string): Promise<boolean> {
        return this.repository.delete(filterId);
    }

    private toSnapshot(filter: AiImageFilterDocument): AiImageFilterSnapshot {
        return {
            filterId: String(filter._id),
            name: filter.name,
            description: filter.description ?? '',
            thumbnailFileName: filter.thumbnailFileName ?? null,
            prompt: filter.prompt,
            negativePrompt: filter.negativePrompt ?? '',
            model: filter.model,
            outputSize: filter.outputSize ?? '1024x1024',
            referenceImageObjectKeys: filter.referenceImageObjectKeys ?? [],
            isActive: filter.isActive ?? true,
            sortOrder: filter.sortOrder ?? 0,
            createdAt: filter.createdAt,
            updatedAt: filter.updatedAt,
        };
    }
}
