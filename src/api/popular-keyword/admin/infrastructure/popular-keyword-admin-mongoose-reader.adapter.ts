import { Injectable } from '@nestjs/common';

import { PopularKeyword } from '../../../../schema/popular-keyword.schema';
import type { PopularKeywordSnapshot } from '../../application/ports/popular-keyword-reader.port';
import { PopularKeywordRepository } from '../../repository/popular-keyword.repository';
import {
    PopularKeywordAdminReaderPort,
} from '../application/ports/popular-keyword-admin-reader.port';

@Injectable()
export class PopularKeywordAdminMongooseReaderAdapter implements PopularKeywordAdminReaderPort {
    constructor(private readonly repository: PopularKeywordRepository) {}

    async readAll(): Promise<PopularKeywordSnapshot[]> {
        const items = await this.repository.findAll();
        return items.map((item) => this.toSnapshot(item));
    }

    async readById(id: string): Promise<PopularKeywordSnapshot | null> {
        const item = await this.repository.findById(id);
        return item ? this.toSnapshot(item) : null;
    }

    async findByKeyword(keyword: string): Promise<PopularKeywordSnapshot | null> {
        const item = await this.repository.findByKeyword(keyword);
        return item ? this.toSnapshot(item) : null;
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
