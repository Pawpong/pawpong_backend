import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';

/**
 * AvailablePet Repository
 * AvailablePet 컬렉션에 대한 데이터 접근 로직
 */
@Injectable()
export class AvailablePetRepository {
    constructor(
        @InjectModel(AvailablePet.name) private availablePetModel: Model<AvailablePetDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
    ) {}

    /**
     * 입양 가능한 반려동물 목록 조회 (오래된 순)
     * 탈퇴/정지된 브리더의 개체는 제외
     * @param limit 조회할 개수
     * @returns AvailablePet 배열
     */
    async findAvailablePets(limit: number = 10): Promise<AvailablePetDocument[]> {
        // 활성 상태인 브리더 ID 목록 조회
        const activeBreeders = await this.breederModel
            .find({ accountStatus: 'active' })
            .select('_id')
            .lean()
            .exec();
        const activeBreederIds = activeBreeders.map((b) => b._id);

        return this.availablePetModel
            .find({
                status: 'available',
                isActive: true,
                breederId: { $in: activeBreederIds }, // 활성 브리더의 개체만 조회
            })
            .populate('breederId', 'name')
            .sort({ createdAt: 1 })
            .limit(limit)
            .exec() as any;
    }

    /**
     * ID로 AvailablePet 조회
     * @param id AvailablePet ID
     * @returns AvailablePet 또는 null
     */
    async findById(id: string): Promise<AvailablePetDocument | null> {
        return this.availablePetModel.findById(id).exec() as any;
    }

    /**
     * 브리더 ID로 AvailablePet 목록 조회
     * @param breederId 브리더 ID
     * @param status 입양 상태 필터 (선택)
     * @returns AvailablePet 배열
     */
    async findByBreederId(breederId: string, status?: string): Promise<AvailablePetDocument[]> {
        const query: any = { breederId, isActive: true };
        if (status) {
            query.status = status;
        }
        return this.availablePetModel.find(query).sort({ createdAt: 1 }).exec() as any;
    }
}
