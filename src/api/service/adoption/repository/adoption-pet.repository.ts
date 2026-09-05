import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { AvailablePet } from '../../../../schema/available-pet.schema';
import { Breeder } from '../../../../schema/breeder.schema';
import type {
    AdoptionPetListQuery,
    AdoptionPetStatus,
    AdoptionPetType,
} from '../application/ports/adoption-pet-reader.port';

@Injectable()
export class AdoptionPetRepository {
    constructor(
        @InjectModel(AvailablePet.name) private readonly model: Model<AvailablePet>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<Breeder>,
    ) {}

    private async buildBaseFilter(input: {
        petType?: AdoptionPetType;
        breederId?: string;
        excludePetId?: string;
        status?: AdoptionPetStatus;
        keyword?: string;
    }): Promise<FilterQuery<AvailablePet>> {
        if (input.breederId && !Types.ObjectId.isValid(input.breederId)) {
            return { isActive: true, breederId: { $in: [] } };
        }
        // 페이지를 자른 뒤 숨기면 개수와 페이지가 어긋난다. 소유자가 없거나 테스트인 펫은
        // 목록·상세 모두 DB 조회 조건에서 제외하며 원본 데이터는 변경하지 않는다.
        const breederIds = await this.breederModel
            .distinct('_id', {
                isTestAccount: { $ne: true },
                ...(input.breederId ? { _id: input.breederId } : {}),
            })
            .exec();
        const filter: FilterQuery<AvailablePet> = { isActive: true, breederId: { $in: breederIds } };
        if (input.petType) {
            filter.petType = input.petType;
        }
        if (input.excludePetId && Types.ObjectId.isValid(input.excludePetId)) {
            filter._id = { $ne: new Types.ObjectId(input.excludePetId) };
        }
        if (input.status) {
            filter.status = input.status;
        }
        if (input.keyword && input.keyword.trim()) {
            // 정규식 특수문자 이스케이프 처리 (ReDoS 방지)
            const escaped = input.keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'i');
            filter.$or = [{ name: regex }, { breed: regex }];
        }
        return filter;
    }

    async countList(
        query: Pick<AdoptionPetListQuery, 'petType' | 'breederId' | 'excludePetId' | 'status' | 'keyword'>,
    ): Promise<number> {
        return this.model.countDocuments(await this.buildBaseFilter(query)).exec();
    }

    async findList(query: AdoptionPetListQuery): Promise<AvailablePet[]> {
        const filter = await this.buildBaseFilter(query);
        // _id 를 마지막 tiebreaker 로 둬 페이지네이션 정렬을 결정적으로 고정한다.
        // (createdAt 이 같은 시드/일괄 등록 데이터는 tiebreaker 없이는 skip/limit 페이지마다
        //  순서가 흔들려 같은 문서가 인접 페이지에 중복 노출되고 다른 문서는 누락된다.)
        const sort: Record<string, 1 | -1> =
            query.sort === 'popular' ? { favoriteCount: -1, createdAt: -1, _id: -1 } : { createdAt: -1, _id: -1 };
        return this.model.find(filter).sort(sort).skip(query.skip).limit(query.limit).exec();
    }

    async findPopular(petType: AdoptionPetType | undefined, limit: number): Promise<AvailablePet[]> {
        const filter = await this.buildBaseFilter({ petType });
        // 인기 동물은 입양 가능 상태만 노출
        filter.status = 'available';
        return this.model.find(filter).sort({ favoriteCount: -1, viewCount: -1, createdAt: -1 }).limit(limit).exec();
    }

    findById(petId: string): Promise<AvailablePet | null> {
        if (!Types.ObjectId.isValid(petId)) {
            return Promise.resolve(null);
        }
        return this.model.findById(petId).exec();
    }

    /**
     * isActive=false 항목은 조회 결과에서 제외한다 (입양 상세 진입 차단).
     */
    async findActiveById(petId: string): Promise<AvailablePet | null> {
        if (!Types.ObjectId.isValid(petId)) {
            return Promise.resolve(null);
        }
        return this.model.findOne({ ...(await this.buildBaseFilter({})), _id: new Types.ObjectId(petId) }).exec();
    }

    async incrementFavoriteCount(petId: string, delta: number): Promise<void> {
        if (!Types.ObjectId.isValid(petId)) {
            return;
        }
        await this.model.updateOne({ _id: new Types.ObjectId(petId) }, { $inc: { favoriteCount: delta } }).exec();
    }

    /**
     * 상세 진입 viewCount 원자 증가. isActive=true 인 도큐먼트만 갱신하며, 갱신 후의 viewCount 를 반환한다.
     * 항목이 없거나 비활성이면 null 반환.
     */
    async incrementViewCount(petId: string): Promise<number | null> {
        if (!Types.ObjectId.isValid(petId)) {
            return null;
        }
        const updated = await this.model
            .findOneAndUpdate(
                { ...(await this.buildBaseFilter({})), _id: new Types.ObjectId(petId) },
                { $inc: { viewCount: 1 } },
                { new: true, projection: { viewCount: 1 } },
            )
            .exec();
        return updated?.viewCount ?? null;
    }
}
