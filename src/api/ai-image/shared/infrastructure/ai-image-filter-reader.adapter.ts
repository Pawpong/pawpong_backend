import { Injectable } from '@nestjs/common';

import type { AiImageFilterDocument } from '../../../../schema/ai-image-filter.schema';
import type { AiImageFilterReaderPort } from '../application/ports/ai-image-filter-reader.port';
import type { AiImageFilterSnapshot } from '../application/types/ai-image-filter-snapshot.type';
import { AiImageFilterRepository } from '../repository/ai-image-filter.repository';

@Injectable()
export class AiImageFilterReaderAdapter implements AiImageFilterReaderPort {
    constructor(private readonly repository: AiImageFilterRepository) {}

    async findActive(): Promise<AiImageFilterSnapshot[]> {
        const filters = await this.repository.findActive();
        return filters.map((filter) => this.toSnapshot(filter));
    }

    async findAll(): Promise<AiImageFilterSnapshot[]> {
        const filters = await this.repository.findAll();
        return filters.map((filter) => this.toSnapshot(filter));
    }

    async findById(filterId: string): Promise<AiImageFilterSnapshot | null> {
        const filter = await this.repository.findById(filterId);
        return filter ? this.toSnapshot(filter) : null;
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
