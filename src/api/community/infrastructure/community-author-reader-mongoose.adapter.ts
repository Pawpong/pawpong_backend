import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import type { CommunityAuthorReaderPort } from '../application/ports/community-author-reader.port';
import type { CommunityAuthorSnapshot } from '../application/types/community-post-write.type';

@Injectable()
export class CommunityAuthorReaderMongooseAdapter implements CommunityAuthorReaderPort {
    constructor(
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    async readAuthorSnapshot(userId: string, role: 'adopter' | 'breeder'): Promise<CommunityAuthorSnapshot | null> {
        if (!Types.ObjectId.isValid(userId)) return null;

        if (role === 'adopter') {
            const adopter = await this.adopterModel
                .findById(userId)
                .select({ _id: 1, nickname: 1, profileImageFileName: 1 })
                .lean<AdopterDocument>()
                .exec();
            if (!adopter) return null;
            return {
                authorId: String(adopter._id),
                authorModel: 'Adopter',
                authorNickname: adopter.nickname,
                authorProfileImageFileName: adopter.profileImageFileName ?? undefined,
            };
        }

        const breeder = await this.breederModel
            .findById(userId)
            .select({ _id: 1, nickname: 1, profileImageFileName: 1 })
            .lean<BreederDocument>()
            .exec();
        if (!breeder) return null;
        return {
            authorId: String(breeder._id),
            authorModel: 'Breeder',
            authorNickname: breeder.nickname,
            authorProfileImageFileName: breeder.profileImageFileName ?? undefined,
        };
    }
}
