import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { ParentPet, ParentPetDocument } from '../../../schema/parent-pet.schema';
import type { BreederManagementParentPetRecord } from '../application/ports/breeder-management-profile.port';
import type { BreederManagementParentPetPersistencePayload } from '../types/breeder-management-document.type';

/**
 * ParentPet Repository
 * 부모견/부모묘 컬렉션에 대한 데이터 접근 로직
 */
@Injectable()
export class ParentPetRepository {
    constructor(@InjectModel(ParentPet.name) private parentPetModel: Model<ParentPetDocument>) {}

    /**
     * ID로 ParentPet 조회
     * @param id ParentPet ID
     * @returns ParentPet 또는 null
     */
    async findById(id: string): Promise<ParentPetDocument | null> {
        return this.parentPetModel.findById(id).exec();
    }

    /**
     * ID와 브리더 ID로 ParentPet 조회 (권한 체크용)
     * @param id ParentPet ID
     * @param breederId 브리더 ID
     * @returns ParentPet 또는 null
     */
    async findByIdAndBreeder(id: string, breederId: string): Promise<ParentPetDocument | null> {
        return this.parentPetModel
            .findOne({
                _id: new Types.ObjectId(id),
                breederId: new Types.ObjectId(breederId),
            })
            .exec();
    }

    /**
     * 브리더 ID로 ParentPet 목록 조회
     * @param breederId 브리더 ID
     * @param isActive 활성화 여부 필터 (선택)
     * @returns ParentPet 배열
     */
    async findByBreederId(breederId: string, isActive?: boolean): Promise<BreederManagementParentPetRecord[]> {
        const query: FilterQuery<ParentPetDocument> = { breederId: new Types.ObjectId(breederId) };
        if (isActive !== undefined) {
            query.isActive = isActive;
        }
        return this.parentPetModel.find(query).sort({ createdAt: 1 }).lean().exec() as Promise<
            BreederManagementParentPetRecord[]
        >;
    }

    /**
     * 새로운 ParentPet 생성
     * @param data 생성할 데이터
     * @returns 생성된 ParentPet
     */
    async create(data: BreederManagementParentPetPersistencePayload): Promise<ParentPetDocument> {
        const parentPet = new this.parentPetModel(data);
        return parentPet.save();
    }

    /**
     * ParentPet 업데이트
     * @param id ParentPet ID
     * @param updateData 업데이트할 데이터
     * @returns 업데이트된 ParentPet 또는 null
     */
    async update(id: string, updateData: Partial<ParentPet>): Promise<ParentPetDocument | null> {
        return this.parentPetModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
    }

    /**
     * ParentPet 삭제
     * @param id ParentPet ID
     * @returns 삭제된 ParentPet 또는 null
     */
    async delete(id: string): Promise<ParentPetDocument | null> {
        return this.parentPetModel.findByIdAndDelete(id).exec();
    }

    /**
     * 브리더의 활성화된 ParentPet 수 조회
     * @param breederId 브리더 ID
     * @returns ParentPet 수
     */
    async countByBreeder(breederId: string): Promise<number> {
        return this.parentPetModel.countDocuments({
            breederId: new Types.ObjectId(breederId),
            isActive: true,
        });
    }
}
