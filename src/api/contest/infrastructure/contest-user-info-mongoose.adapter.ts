import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import type { ContestUserInfoPort, ContestUserInfoSnapshot } from '../application/ports/contest-user-info.port';

@Injectable()
export class ContestUserInfoMongooseAdapter implements ContestUserInfoPort {
    constructor(
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    async readUserInfo(userId: string, role: 'adopter' | 'breeder'): Promise<ContestUserInfoSnapshot | null> {
        if (!Types.ObjectId.isValid(userId)) return null;

        if (role === 'adopter') {
            const adopter = await this.adopterModel
                .findById(userId)
                .select({ nickname: 1, profileImageFileName: 1 })
                .lean<AdopterDocument>()
                .exec();
            if (!adopter) return null;
            return {
                displayName: adopter.nickname ?? '',
                profileImageFileName: adopter.profileImageFileName ?? null,
            };
        }

        const breeder = await this.breederModel
            .findById(userId)
            .select({ nickname: 1, name: 1, profileImageFileName: 1 })
            .lean<BreederDocument>()
            .exec();
        if (!breeder) return null;

        const displayName = (breeder.name && breeder.name.trim()) || breeder.nickname || '';
        return {
            displayName,
            profileImageFileName: breeder.profileImageFileName ?? null,
        };
    }
}
