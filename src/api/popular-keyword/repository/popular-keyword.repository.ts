import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PopularKeyword } from '../../../schema/popular-keyword.schema';
import type {
    CreatePopularKeywordCommand,
    UpdatePopularKeywordCommand,
} from '../admin/application/types/popular-keyword-command.type';

@Injectable()
export class PopularKeywordRepository {
    constructor(@InjectModel(PopularKeyword.name) private readonly model: Model<PopularKeyword>) {}

    findActiveAll(): Promise<PopularKeyword[]> {
        return this.model.find({ isActive: true }).sort({ rank: 1, createdAt: 1 }).exec();
    }

    findAll(): Promise<PopularKeyword[]> {
        return this.model.find().sort({ rank: 1, createdAt: 1 }).exec();
    }

    findById(id: string): Promise<PopularKeyword | null> {
        return this.model.findById(id).exec();
    }

    findByKeyword(keyword: string): Promise<PopularKeyword | null> {
        return this.model.findOne({ keyword }).exec();
    }

    async create(command: CreatePopularKeywordCommand): Promise<PopularKeyword> {
        const doc = new this.model({
            keyword: command.keyword,
            rank: command.rank ?? 0,
            isActive: command.isActive ?? true,
        });
        return doc.save();
    }

    async update(id: string, command: UpdatePopularKeywordCommand): Promise<PopularKeyword | null> {
        const doc = await this.model.findById(id).exec();

        if (!doc) {
            return null;
        }

        if (command.keyword !== undefined) doc.keyword = command.keyword;
        if (command.rank !== undefined) doc.rank = command.rank;
        if (command.isActive !== undefined) doc.isActive = command.isActive;

        return doc.save();
    }

    async deleteById(id: string): Promise<boolean> {
        const deleted = await this.model.findByIdAndDelete(id).exec();
        return !!deleted;
    }
}
