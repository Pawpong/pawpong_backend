import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { PetStatus } from '../../../../common/enum/user.enum';

import { AvailablePet, AvailablePetDocument } from '../../../../schema/available-pet.schema';
import type {
    BreederManagementAvailablePetPersistencePayload,
    BreederManagementPetDocumentRecord,
} from '../types/breeder-management-document.type';

/**
 * AvailablePetManagement Repository
 * 브리더 관리용 분양 가능 반려동물 컬렉션 데이터 접근 로직
 */
@Injectable()
export class AvailablePetManagementRepository {
    constructor(@InjectModel(AvailablePet.name) private availablePetModel: Model<AvailablePetDocument>) {}

    /**
     * ID로 AvailablePet 조회
     * @param id AvailablePet ID
     * @returns AvailablePet 또는 null
     */
    async findById(id: string): Promise<AvailablePetDocument | null> {
        return this.availablePetModel.findById(id).exec();
    }

    /**
     * ID와 브리더 ID로 AvailablePet 조회 (권한 체크용)
     * @param id AvailablePet ID
     * @param breederId 브리더 ID
     * @returns AvailablePet 또는 null
     */
    async findByIdAndBreeder(id: string, breederId: string): Promise<AvailablePetDocument | null> {
        return this.availablePetModel
            .findOne({
                _id: new Types.ObjectId(id),
                breederId: new Types.ObjectId(breederId),
            })
            .exec();
    }

    /**
     * 브리더 ID로 AvailablePet 목록 조회 (필터링 및 페이지네이션)
     * @param breederId 브리더 ID
     * @param options 조회 옵션 (status, includeInactive, page, limit)
     * @returns AvailablePet 목록과 전체 개수
     */
    async findByBreederIdWithFilters(
        breederId: string,
        options: {
            status?: string;
            includeInactive?: boolean;
            page?: number;
            limit?: number;
        } = {},
    ): Promise<{ pets: BreederManagementPetDocumentRecord[]; total: number }> {
        const { status, includeInactive = false, page = 1, limit = 20 } = options;

        // 필터 조건 구성
        const filter: FilterQuery<AvailablePetDocument> = { breederId: new Types.ObjectId(breederId) };
        if (!includeInactive) {
            filter.isActive = true;
        }
        if (status) {
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const [pets, total] = await Promise.all([
            this.availablePetModel.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).lean().exec() as Promise<
                BreederManagementPetDocumentRecord[]
            >,
            this.availablePetModel.countDocuments(filter),
        ]);

        return { pets, total };
    }

    /**
     * 브리더의 특정 상태별 AvailablePet 수 조회
     * @param breederId 브리더 ID
     * @param status 반려동물 상태
     * @param isActive 활성화 여부
     * @returns AvailablePet 수
     */
    async countByStatus(breederId: string, status: PetStatus, isActive: boolean = true): Promise<number> {
        return this.availablePetModel.countDocuments({
            breederId: new Types.ObjectId(breederId),
            status,
            isActive,
        });
    }

    /**
     * 브리더의 비활성화된 AvailablePet 수 조회
     * @param breederId 브리더 ID
     * @returns 비활성화된 AvailablePet 수
     */
    async countInactive(breederId: string): Promise<number> {
        return this.availablePetModel.countDocuments({
            breederId: new Types.ObjectId(breederId),
            isActive: false,
        });
    }

    /**
     * 새로운 AvailablePet 생성
     * @param data 생성할 데이터
     * @returns 생성된 AvailablePet
     */
    async create(data: BreederManagementAvailablePetPersistencePayload): Promise<AvailablePetDocument> {
        const availablePet = new this.availablePetModel(data);
        return availablePet.save();
    }

    /**
     * AvailablePet 업데이트
     * @param id AvailablePet ID
     * @param updateData 업데이트할 데이터
     * @returns 업데이트된 AvailablePet 또는 null
     */
    async update(id: string, updateData: Partial<AvailablePet>): Promise<AvailablePetDocument | null> {
        return this.availablePetModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
    }

    /**
     * AvailablePet 상태 업데이트
     * @param id AvailablePet ID
     * @param status 새로운 상태
     * @returns 업데이트된 AvailablePet 또는 null
     */
    async updateStatus(id: string, status: PetStatus): Promise<AvailablePetDocument | null> {
        return this.availablePetModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
    }

    /**
     * 분양중(available) 인 펫만 예약중(reserved)으로 전이한다.
     * 조건을 필터에 함께 넣어 원자적으로 처리한다 — 이미 분양완료된 펫을 예약중으로 되돌리면 안 되고,
     * 상담완료 처리가 동시에 두 건 들어와도 한 번만 전이되어야 하기 때문이다.
     * @param id AvailablePet ID
     * @param reservedAt 예약 시각
     * @returns 실제로 전이됐으면 true (이미 예약중이거나 분양완료면 false)
     */
    async reserveIfAvailable(id: string, reservedAt: Date): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) return false;
        const result = await this.availablePetModel
            .updateOne(
                { _id: new Types.ObjectId(id), status: PetStatus.AVAILABLE },
                { $set: { status: PetStatus.RESERVED, reservedAt } },
            )
            .exec();
        return result.modifiedCount > 0;
    }

    /**
     * 예약중(reserved) 인 펫만 분양중(available)으로 되돌리고 예약 시각을 지운다.
     * 분양완료(adopted)는 필터에서 걸러지므로 확정된 펫이 다시 노출될 일은 없다.
     * @param id AvailablePet ID
     * @returns 실제로 되돌렸으면 true
     */
    async releaseIfReserved(id: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(id)) return false;
        const result = await this.availablePetModel
            .updateOne(
                { _id: new Types.ObjectId(id), status: PetStatus.RESERVED },
                { $set: { status: PetStatus.AVAILABLE }, $unset: { reservedAt: '' } },
            )
            .exec();
        return result.modifiedCount > 0;
    }

    /**
     * AvailablePet 삭제
     * @param id AvailablePet ID
     * @returns 삭제된 AvailablePet 또는 null
     */
    async delete(id: string): Promise<AvailablePetDocument | null> {
        return this.availablePetModel.findByIdAndDelete(id).exec();
    }

    /**
     * 브리더의 모든 AvailablePet 비활성화 (탈퇴 시 사용)
     * @param breederId 브리더 ID
     * @returns 비활성화된 개체 수
     */
    async deactivateAllByBreeder(breederId: string): Promise<number> {
        const result = await this.availablePetModel.updateMany(
            { breederId: new Types.ObjectId(breederId), isActive: true },
            { $set: { isActive: false, updatedAt: new Date() } },
        );
        return result.modifiedCount;
    }
}
