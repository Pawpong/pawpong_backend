import { Injectable } from '@nestjs/common';

import { PopularKeyword } from '../../../../schema/popular-keyword.schema';
import type { PopularKeywordSnapshot } from '../../application/ports/popular-keyword-reader.port';
import { PopularKeywordRepository } from '../../repository/popular-keyword.repository';
import { PopularKeywordWriterPort } from '../application/ports/popular-keyword-writer.port';
import type {
    CreatePopularKeywordCommand,
    UpdatePopularKeywordCommand,
} from '../application/types/popular-keyword-command.type';

@Injectable()
export class PopularKeywordMongooseWriterAdapter implements PopularKeywordWriterPort {
    constructor(private readonly repository: PopularKeywordRepository) {}

    async create(command: CreatePopularKeywordCommand): Promise<PopularKeywordSnapshot> {
        const created = await this.repository.create(command);
        return this.toSnapshot(created);
    }

    async update(id: string, command: UpdatePopularKeywordCommand): Promise<PopularKeywordSnapshot | null> {
        const updated = await this.repository.update(id, command);
        return updated ? this.toSnapshot(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        return this.repository.deleteById(id);
    }

    private toSnapshot(item: PopularKeyword): PopularKeywordSnapshot {
        return {
            id: item._id.toString(),
            keyword: item.keyword,
            rank: item.rank,
            isActive: item.isActive,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
}
