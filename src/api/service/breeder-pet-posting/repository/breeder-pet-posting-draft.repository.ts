import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    BreederPetPostingDraft,
    BreederPetPostingDraftDocument,
} from '../../../../schema/breeder-pet-posting-draft.schema';
import type { BreederPetPostingDraftForm } from '../application/types/breeder-pet-posting-draft.type';

/**
 * v2 분양글 임시저장 — Mongoose 직접 접근 캡슐화.
 * 모든 조작이 breederId 소유자 필터를 포함해 타인 draft 접근을 쿼리 레벨에서 차단한다.
 */
@Injectable()
export class BreederPetPostingDraftRepository {
    constructor(
        @InjectModel(BreederPetPostingDraft.name)
        private readonly draftModel: Model<BreederPetPostingDraftDocument>,
    ) {}

    async create(breederId: string, form: BreederPetPostingDraftForm): Promise<{ draftId: string }> {
        const created = await this.draftModel.create({
            breederId: new Types.ObjectId(breederId),
            form,
        });
        return { draftId: String(created._id) };
    }

    async updateByOwner(
        draftId: string,
        breederId: string,
        form: BreederPetPostingDraftForm,
    ): Promise<{ updated: boolean }> {
        if (!Types.ObjectId.isValid(draftId) || !Types.ObjectId.isValid(breederId)) {
            return { updated: false };
        }
        const result = await this.draftModel
            .updateOne(
                { _id: new Types.ObjectId(draftId), breederId: new Types.ObjectId(breederId) },
                { $set: { form } },
            )
            .exec();
        return { updated: result.matchedCount > 0 };
    }

    async listByOwner(breederId: string): Promise<BreederPetPostingDraftDocument[]> {
        if (!Types.ObjectId.isValid(breederId)) {
            return [];
        }
        return this.draftModel
            .find({ breederId: new Types.ObjectId(breederId) })
            .sort({ updatedAt: -1 })
            .lean<BreederPetPostingDraftDocument[]>()
            .exec();
    }

    async findByOwner(draftId: string, breederId: string): Promise<BreederPetPostingDraftDocument | null> {
        if (!Types.ObjectId.isValid(draftId) || !Types.ObjectId.isValid(breederId)) {
            return null;
        }
        return this.draftModel
            .findOne({ _id: new Types.ObjectId(draftId), breederId: new Types.ObjectId(breederId) })
            .lean<BreederPetPostingDraftDocument>()
            .exec();
    }

    async deleteByOwner(draftId: string, breederId: string): Promise<{ deleted: boolean }> {
        if (!Types.ObjectId.isValid(draftId) || !Types.ObjectId.isValid(breederId)) {
            return { deleted: false };
        }
        const result = await this.draftModel
            .deleteOne({ _id: new Types.ObjectId(draftId), breederId: new Types.ObjectId(breederId) })
            .exec();
        return { deleted: result.deletedCount > 0 };
    }

    async countByOwner(breederId: string): Promise<number> {
        if (!Types.ObjectId.isValid(breederId)) {
            return 0;
        }
        return this.draftModel.countDocuments({ breederId: new Types.ObjectId(breederId) }).exec();
    }
}
