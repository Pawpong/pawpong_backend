import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import type { AdminPushRecipientSnapshot } from '../application/types/admin-push.type';

/**
 * v2 어드민 푸시 수신자(adopter / breeder) 컬렉션 직접 조회.
 * 활성 사용자만 + 토큰 보유자만 필터링한다.
 */
@Injectable()
export class AdminPushRecipientRepository {
    constructor(
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    async listAdopters(): Promise<AdminPushRecipientSnapshot[]> {
        const docs = await this.adopterModel
            .find({ accountStatus: 'active', 'pushDeviceTokens.0': { $exists: true } })
            .select({ _id: 1, pushDeviceTokens: 1 })
            .lean<Array<{ _id: Types.ObjectId; pushDeviceTokens: Array<{ token: string }> }>>()
            .exec();
        return docs
            .map((d) => ({
                userId: String(d._id),
                userRole: 'adopter' as const,
                tokens: (d.pushDeviceTokens ?? []).map((t) => t.token).filter((t) => !!t),
            }))
            .filter((r) => r.tokens.length > 0);
    }

    async listBreeders(): Promise<AdminPushRecipientSnapshot[]> {
        const docs = await this.breederModel
            .find({ accountStatus: 'active', 'pushDeviceTokens.0': { $exists: true } })
            .select({ _id: 1, pushDeviceTokens: 1 })
            .lean<Array<{ _id: Types.ObjectId; pushDeviceTokens: Array<{ token: string }> }>>()
            .exec();
        return docs
            .map((d) => ({
                userId: String(d._id),
                userRole: 'breeder' as const,
                tokens: (d.pushDeviceTokens ?? []).map((t) => t.token).filter((t) => !!t),
            }))
            .filter((r) => r.tokens.length > 0);
    }

    async findOneAdopter(userId: string): Promise<AdminPushRecipientSnapshot | null> {
        if (!Types.ObjectId.isValid(userId)) return null;
        const doc = await this.adopterModel
            .findOne({ _id: new Types.ObjectId(userId), accountStatus: 'active' })
            .select({ _id: 1, pushDeviceTokens: 1 })
            .lean<{ _id: Types.ObjectId; pushDeviceTokens?: Array<{ token: string }> }>()
            .exec();
        if (!doc) return null;
        const tokens = (doc.pushDeviceTokens ?? []).map((t) => t.token).filter((t) => !!t);
        return { userId: String(doc._id), userRole: 'adopter', tokens };
    }

    async findOneBreeder(userId: string): Promise<AdminPushRecipientSnapshot | null> {
        if (!Types.ObjectId.isValid(userId)) return null;
        const doc = await this.breederModel
            .findOne({ _id: new Types.ObjectId(userId), accountStatus: 'active' })
            .select({ _id: 1, pushDeviceTokens: 1 })
            .lean<{ _id: Types.ObjectId; pushDeviceTokens?: Array<{ token: string }> }>()
            .exec();
        if (!doc) return null;
        const tokens = (doc.pushDeviceTokens ?? []).map((t) => t.token).filter((t) => !!t);
        return { userId: String(doc._id), userRole: 'breeder', tokens };
    }
}
