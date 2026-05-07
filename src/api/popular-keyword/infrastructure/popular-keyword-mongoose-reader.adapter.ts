import { Injectable } from '@nestjs/common';

import { PopularKeyword } from '../../../schema/popular-keyword.schema';
import { PopularKeywordReaderPort, PopularKeywordSnapshot } from '../application/ports/popular-keyword-reader.port';
import { PopularKeywordRepository } from '../repository/popular-keyword.repository';

@Injectable()
export class PopularKeywordMongooseReaderAdapter implements PopularKeywordReaderPort {
    constructor(private readonly repository: PopularKeywordRepository) {}

    async readActiveAll(): Promise<PopularKeywordSnapshot[]> {
        const items = await this.repository.findActiveAll();
        return items.map((item) => this.toSnapshot(item));
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
