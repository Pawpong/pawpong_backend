import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AdopterPetFavorite } from '../../../schema/adopter-pet-favorite.schema';

@Injectable()
export class AdopterPetFavoriteRepository {
    constructor(@InjectModel(AdopterPetFavorite.name) private readonly model: Model<AdopterPetFavorite>) {}

    async exists(adopterId: string, petId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(adopterId) || !Types.ObjectId.isValid(petId)) {
            return false;
        }
        const found = await this.model.exists({
            adopterId: new Types.ObjectId(adopterId),
            petId: new Types.ObjectId(petId),
        });
        return Boolean(found);
    }

    async findFavoritedPetIds(adopterId: string, petIds: string[]): Promise<Set<string>> {
        if (!Types.ObjectId.isValid(adopterId) || petIds.length === 0) {
            return new Set();
        }
        const validPetIds = petIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        if (validPetIds.length === 0) {
            return new Set();
        }
        const docs = await this.model
            .find({ adopterId: new Types.ObjectId(adopterId), petId: { $in: validPetIds } }, { petId: 1 })
            .lean()
            .exec();
        return new Set(docs.map((doc) => doc.petId.toString()));
    }

    async add(adopterId: string, petId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(adopterId) || !Types.ObjectId.isValid(petId)) {
            return false;
        }
        try {
            await this.model.create({
                adopterId: new Types.ObjectId(adopterId),
                petId: new Types.ObjectId(petId),
            });
            return true;
        } catch (error: unknown) {
            // E11000 duplicate key 는 이미 즐겨찾기 등록된 상태로 간주 (idempotent)
            if (this.isDuplicateKeyError(error)) {
                return false;
            }
            throw error;
        }
    }

    async remove(adopterId: string, petId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(adopterId) || !Types.ObjectId.isValid(petId)) {
            return false;
        }
        const result = await this.model
            .deleteOne({ adopterId: new Types.ObjectId(adopterId), petId: new Types.ObjectId(petId) })
            .exec();
        return result.deletedCount > 0;
    }

    private isDuplicateKeyError(error: unknown): boolean {
        return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code?: number }).code === 11000);
    }
}
