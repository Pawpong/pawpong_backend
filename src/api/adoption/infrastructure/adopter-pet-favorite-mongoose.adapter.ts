import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';

import { AdopterPetFavorite } from '../../../schema/adopter-pet-favorite.schema';
import { AvailablePet } from '../../../schema/available-pet.schema';
import {
    AdopterPetFavoriteReaderPort,
    AdopterPetFavoriteWriterPort,
    FavoriteAtomicResult,
} from '../application/ports/adopter-pet-favorite.port';

/**
 * Mongoose 어댑터 — 즐겨찾기 추가/제거 + favoriteCount 증감을
 * 단일 트랜잭션으로 묶어 카운터 무결성을 보장한다.
 *
 * read 경로(isFavorited / findFavoritedPetIds)는 read-only 라 트랜잭션이 필요 없다.
 */
@Injectable()
export class AdopterPetFavoriteMongooseAdapter
    implements AdopterPetFavoriteReaderPort, AdopterPetFavoriteWriterPort
{
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(AdopterPetFavorite.name) private readonly favoriteModel: Model<AdopterPetFavorite>,
        @InjectModel(AvailablePet.name) private readonly petModel: Model<AvailablePet>,
    ) {}

    async isFavorited(adopterId: string, petId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(adopterId) || !Types.ObjectId.isValid(petId)) {
            return false;
        }
        const found = await this.favoriteModel.exists({
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
        const docs = await this.favoriteModel
            .find({ adopterId: new Types.ObjectId(adopterId), petId: { $in: validPetIds } }, { petId: 1 })
            .lean()
            .exec();
        return new Set(docs.map((doc) => doc.petId.toString()));
    }

    async addAtomic(adopterId: string, petId: string): Promise<FavoriteAtomicResult> {
        if (!Types.ObjectId.isValid(adopterId) || !Types.ObjectId.isValid(petId)) {
            return { changed: false, favoriteCount: 0 };
        }

        const adopterObjectId = new Types.ObjectId(adopterId);
        const petObjectId = new Types.ObjectId(petId);

        const session = await this.connection.startSession();
        let result: FavoriteAtomicResult = { changed: false, favoriteCount: 0 };

        try {
            await session.withTransaction(async () => {
                let changed = false;
                try {
                    await this.favoriteModel.create([{ adopterId: adopterObjectId, petId: petObjectId }], {
                        session,
                    });
                    changed = true;
                } catch (error: unknown) {
                    if (!this.isDuplicateKeyError(error)) {
                        throw error;
                    }
                    // 이미 즐겨찾기 등록된 상태 — 카운터 변경 없이 idempotent 처리
                }

                if (changed) {
                    const updated = await this.petModel
                        .findOneAndUpdate(
                            { _id: petObjectId },
                            { $inc: { favoriteCount: 1 } },
                            { new: true, projection: { favoriteCount: 1 }, session },
                        )
                        .exec();
                    result = { changed: true, favoriteCount: updated?.favoriteCount ?? 0 };
                } else {
                    const pet = await this.petModel
                        .findById(petObjectId, { favoriteCount: 1 }, { session })
                        .exec();
                    result = { changed: false, favoriteCount: pet?.favoriteCount ?? 0 };
                }
            });
        } finally {
            await session.endSession();
        }

        return result;
    }

    async removeAtomic(adopterId: string, petId: string): Promise<FavoriteAtomicResult> {
        if (!Types.ObjectId.isValid(adopterId) || !Types.ObjectId.isValid(petId)) {
            return { changed: false, favoriteCount: 0 };
        }

        const adopterObjectId = new Types.ObjectId(adopterId);
        const petObjectId = new Types.ObjectId(petId);

        const session = await this.connection.startSession();
        let result: FavoriteAtomicResult = { changed: false, favoriteCount: 0 };

        try {
            await session.withTransaction(async () => {
                const deleteResult = await this.favoriteModel
                    .deleteOne({ adopterId: adopterObjectId, petId: petObjectId }, { session })
                    .exec();
                const changed = deleteResult.deletedCount > 0;

                if (changed) {
                    // favoriteCount 가 0 보다 큰 경우에만 감소 (음수 방지)
                    const updated = await this.petModel
                        .findOneAndUpdate(
                            { _id: petObjectId, favoriteCount: { $gt: 0 } },
                            { $inc: { favoriteCount: -1 } },
                            { new: true, projection: { favoriteCount: 1 }, session },
                        )
                        .exec();

                    if (updated) {
                        result = { changed: true, favoriteCount: updated.favoriteCount };
                    } else {
                        // 이미 0 — 그대로 유지
                        result = { changed: true, favoriteCount: 0 };
                    }
                } else {
                    const pet = await this.petModel
                        .findById(petObjectId, { favoriteCount: 1 }, { session })
                        .exec();
                    result = { changed: false, favoriteCount: pet?.favoriteCount ?? 0 };
                }
            });
        } finally {
            await session.endSession();
        }

        return result;
    }

    private isDuplicateKeyError(error: unknown): boolean {
        return Boolean(
            error && typeof error === 'object' && 'code' in error && (error as { code?: number }).code === 11000,
        );
    }
}
