import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';

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

    async findBreedersByIds(breederIds: string[]): Promise<BreederDocument[]> {
        const objectIds = breederIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        if (objectIds.length === 0) return [];
        return this.breederModel.find({ _id: { $in: objectIds } }).lean<BreederDocument[]>().exec();
    }

    /**
     * 브리더의 가장 최근 활성 분양 펫 status 1개를 반환.
     * 마이홈 즐겨찾는 브리더 카드의 "분양 진행중" / "분양 완료" 뱃지 표기용.
     */
    async findRecentPetStatusByBreederIds(breederIds: string[]): Promise<Map<string, 'available' | 'reserved' | 'adopted'>> {
        const objectIds = breederIds.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
        const result = new Map<string, 'available' | 'reserved' | 'adopted'>();
        if (objectIds.length === 0) return result;

        const docs = await this.availablePetModel
            .aggregate<{ _id: Types.ObjectId; status: 'available' | 'reserved' | 'adopted' }>([
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

    async isFavoritedBy(adopterId: string, breederId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(adopterId)) return false;
        const adopter = await this.adopterModel
            .findById(adopterId)
            .select({ favoriteBreederList: 1 })
            .lean<{ favoriteBreederList?: Array<{ favoriteBreederId: string }> }>()
            .exec();
        if (!adopter?.favoriteBreederList) return false;
        return adopter.favoriteBreederList.some((entry) => entry.favoriteBreederId === breederId);
    }
}
