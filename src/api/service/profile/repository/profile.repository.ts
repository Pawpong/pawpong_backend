import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { AvailablePet, AvailablePetDocument } from '../../../../schema/available-pet.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';

type FavoriteBreederEntry = { favoriteBreederId: string };
type FavoriteBreederListProjection = { favoriteBreederList?: FavoriteBreederEntry[] };

/**
 * v2 profile — Mongoose 직접 접근을 캡슐화.
 * adapter 는 본 repository 만 통해 데이터에 접근한다.
 */
@Injectable()
export class ProfileRepository {
    constructor(
        @InjectModel(Adopter.name)
        private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name)
        private readonly breederModel: Model<BreederDocument>,
        @InjectModel(AvailablePet.name)
        private readonly availablePetModel: Model<AvailablePetDocument>,
    ) {}

    async findAdopterById(userId: string): Promise<AdopterDocument | null> {
        if (!Types.ObjectId.isValid(userId)) return null;
        return this.adopterModel.findById(userId).lean<AdopterDocument>().exec();
    }

    async findBreederById(breederId: string): Promise<BreederDocument | null> {
        if (!Types.ObjectId.isValid(breederId)) return null;
        return this.breederModel.findById(breederId).lean<BreederDocument>().exec();
    }

    async findAdoptersByIds(adopterIds: string[]): Promise<AdopterDocument[]> {
        const objectIds = adopterIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        if (objectIds.length === 0) return [];
        return this.adopterModel
            .find({ _id: { $in: objectIds } })
            .lean<AdopterDocument[]>()
            .exec();
    }

    async findBreedersByIds(breederIds: string[]): Promise<BreederDocument[]> {
        const objectIds = breederIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        if (objectIds.length === 0) return [];
        return this.breederModel
            .find({ _id: { $in: objectIds } })
            .lean<BreederDocument[]>()
            .exec();
    }

    /**
     * 브리더의 가장 최근 활성 분양 펫 status 1개를 반환.
     * 마이홈 즐겨찾는 브리더 카드의 "분양 진행중" / "분양 완료" 뱃지 표기용.
     */
    async findRecentPetStatusByBreederIds(
        breederIds: string[],
    ): Promise<Map<string, 'available' | 'reserved' | 'adopted'>> {
        const objectIds = breederIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        const result = new Map<string, 'available' | 'reserved' | 'adopted'>();
        if (objectIds.length === 0) return result;

        const docs = await this.availablePetModel
            .aggregate<{
                _id: Types.ObjectId;
                status: 'available' | 'reserved' | 'adopted';
            }>([
                { $match: { breederId: { $in: objectIds }, isActive: true } },
                { $sort: { createdAt: -1 } },
                { $group: { _id: '$breederId', status: { $first: '$status' } } },
            ])
            .exec();

        for (const doc of docs) {
            result.set(String(doc._id), doc.status);
        }
        return result;
    }

    async isFavoritedBy(userId: string, breederId: string, userRole?: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(userId)) return false;
        const favoriteBreederList = await this.readFavoriteBreederList(userId, userRole);
        return favoriteBreederList.some((entry) => entry.favoriteBreederId === breederId);
    }

    /**
     * 즐겨찾기 목록은 역할별로 다른 도큐먼트에 임베드된다.
     * 입양자는 Adopter.favoriteBreederList, 브리더는 Breeder.favoriteBreederList 를 읽는다
     * (AdopterProfileAdapter 의 쓰기 경로 분기와 같은 규칙이라 읽기/쓰기가 같은 곳을 본다).
     */
    private async readFavoriteBreederList(userId: string, userRole?: string): Promise<FavoriteBreederEntry[]> {
        if (userRole === 'breeder') {
            const breeder = await this.breederModel
                .findById(userId)
                .select({ favoriteBreederList: 1 })
                .lean<FavoriteBreederListProjection>()
                .exec();
            return breeder?.favoriteBreederList ?? [];
        }

        const adopter = await this.adopterModel
            .findById(userId)
            .select({ favoriteBreederList: 1 })
            .lean<FavoriteBreederListProjection>()
            .exec();
        return adopter?.favoriteBreederList ?? [];
    }

    /**
     * 입양자 프로필 편집 (bio 만 지원 — Adopter 스키마에 location 없음). 도큐먼트 자체가 없으면 false.
     * 변경 항목이 없거나 동일 값이라도 true 로 처리 — 호출측 idempotent.
     */
    async updateAdopterProfile(userId: string, patch: { bio?: string }): Promise<boolean> {
        if (!Types.ObjectId.isValid(userId)) return false;
        const $set: Record<string, unknown> = {};
        if (patch.bio !== undefined) $set.bio = patch.bio;

        if (Object.keys($set).length === 0) {
            const exists = await this.adopterModel.exists({ _id: new Types.ObjectId(userId) });
            return Boolean(exists);
        }

        const result = await this.adopterModel.updateOne({ _id: new Types.ObjectId(userId) }, { $set }).exec();
        return result.matchedCount > 0;
    }

    /**
     * 브리더 프로필 편집 (bio 만 지원 — 사업장 위치는 breeder-management/profile 이 단독 소유).
     * 도큐먼트 자체가 없으면 false.
     */
    async updateBreederProfile(breederId: string, patch: { bio?: string }): Promise<boolean> {
        if (!Types.ObjectId.isValid(breederId)) return false;
        const $set: Record<string, unknown> = {};
        if (patch.bio !== undefined) $set.bio = patch.bio;

        if (Object.keys($set).length === 0) {
            const exists = await this.breederModel.exists({ _id: new Types.ObjectId(breederId) });
            return Boolean(exists);
        }

        const result = await this.breederModel.updateOne({ _id: new Types.ObjectId(breederId) }, { $set }).exec();
        return result.matchedCount > 0;
    }
}
