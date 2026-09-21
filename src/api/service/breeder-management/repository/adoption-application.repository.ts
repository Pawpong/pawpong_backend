import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ApplicationStatus } from '../../../../common/enum/user.enum';

import { AdoptionApplication, AdoptionApplicationDocument } from '../../../../schema/adoption-application.schema';
import type {
    BreederManagementApplicationDocumentRecord,
    BreederManagementPetCountAggregateRecord,
    BreederManagementRecentApplicationDocumentRecord,
} from '../types/breeder-management-document.type';

/** 확정 후속으로 자동 거절된 신청 — 알림 발송 대상을 식별하는 데 쓴다 */
export interface RejectedApplicationRecord {
    applicationId: string;
    adopterId: string;
}

/**
 * AdoptionApplication Repository
 * 입양 신청 컬렉션에 대한 데이터 접근 로직
 */
@Injectable()
export class AdoptionApplicationRepository {
    constructor(
        @InjectModel(AdoptionApplication.name) private adoptionApplicationModel: Model<AdoptionApplicationDocument>,
    ) {}

    /**
     * ID로 AdoptionApplication 조회
     * @param id AdoptionApplication ID
     * @returns AdoptionApplication 또는 null
     */
    async findById(id: string): Promise<AdoptionApplicationDocument | null> {
        return this.adoptionApplicationModel.findById(id).exec();
    }

    /**
     * ID와 브리더 ID로 AdoptionApplication 조회 (권한 체크용)
     * @param id AdoptionApplication ID
     * @param breederId 브리더 ID
     * @returns AdoptionApplication 또는 null
     */
    async findByIdAndBreeder(id: string, breederId: string): Promise<AdoptionApplicationDocument | null> {
        return this.adoptionApplicationModel.findOne({ _id: id, breederId }).exec();
    }

    /**
     * 브리더가 받은 입양 신청 목록 조회 (페이지네이션)
     * @param breederId 브리더 ID
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 입양 신청 목록과 전체 개수
     */
    async findByBreederId(
        breederId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ applications: BreederManagementApplicationDocumentRecord[]; total: number }> {
        const skip = (page - 1) * limit;

        const [applications, total] = await Promise.all([
            this.adoptionApplicationModel
                .find({ breederId })
                .populate('adopterId', 'nickname') // 입양자 닉네임 populate
                .sort({ appliedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec() as Promise<BreederManagementApplicationDocumentRecord[]>,
            this.adoptionApplicationModel.countDocuments({ breederId }),
        ]);

        return { applications, total };
    }

    /**
     * 특정 상태의 입양 신청 수 조회
     * @param breederId 브리더 ID
     * @param status 입양 신청 상태
     * @returns 해당 상태의 입양 신청 수
     */
    async countByStatus(breederId: string, status: ApplicationStatus): Promise<number> {
        return this.adoptionApplicationModel.countDocuments({ breederId, status });
    }

    /**
     * 최근 입양 신청 목록 조회
     * @param breederId 브리더 ID
     * @param limit 조회할 개수
     * @returns 최근 입양 신청 목록
     */
    async findRecentByBreeder(
        breederId: string,
        limit: number = 5,
    ): Promise<BreederManagementRecentApplicationDocumentRecord[]> {
        return this.adoptionApplicationModel
            .find({ breederId })
            .sort({ appliedAt: -1 })
            .limit(limit)
            .lean<BreederManagementRecentApplicationDocumentRecord[]>()
            .exec();
    }

    /**
     * 반려동물별 입양 신청 수 집계
     * @param petIds 반려동물 ID 배열
     * @returns 반려동물별 입양 신청 수 맵
     */
    async countByPetIds(petIds: string[]): Promise<Map<string, number>> {
        const result = await this.adoptionApplicationModel.aggregate([
            { $match: { petId: { $in: petIds } } },
            { $group: { _id: '$petId', count: { $sum: 1 } } },
        ]);

        return new Map(result.map((item) => [String(item._id), item.count]));
    }

    /**
     * 입양 신청 상태 업데이트
     * @param id AdoptionApplication ID
     * @param status 새로운 상태
     * @returns 업데이트된 AdoptionApplication 또는 null
     */
    async updateStatus(id: string, status: ApplicationStatus): Promise<AdoptionApplicationDocument | null> {
        return this.adoptionApplicationModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    }

    /**
     * 입양 확정 시각 기록
     * status 전이(updateStatus)와 같은 시각을 받아 approvedAt 에 기록한다.
     * @param id AdoptionApplication ID
     * @param approvedAt 확정 시각
     */
    async recordApprovedAt(id: string, approvedAt: Date): Promise<void> {
        await this.adoptionApplicationModel.updateOne({ _id: id }, { $set: { approvedAt } }).exec();
    }

    /**
     * 같은 펫의 다른 처리 중 신청 일괄 거절
     * 한 펫은 한 명에게만 가므로, 확정 시 나머지 대기 신청을 종결시켜 유령 신청을 남기지 않는다.
     *
     * 건수가 아니라 거절된 신청의 식별자를 반환한다 — 호출자가 이 사람들에게 "진행 종료" 알림을
     * 보내야 하기 때문이다. updateMany 는 어떤 문서가 바뀌었는지 알려주지 않으므로, 대상을 먼저
     * 찾고 문서마다 조건부 전이한다. 조건(열린 상태)을 필터에 그대로 남겨 두어 조회와 전이 사이에
     * 상태가 바뀐 신청은 건너뛰고, 실제로 전이된 건만 반환한다 — 엉뚱한 사람에게 거절 알림이
     * 나가면 안 된다.
     *
     * @param petId 반려동물 ID
     * @param approvedApplicationId 확정된 신청 ID (거절 대상에서 제외)
     * @returns 실제로 거절 처리된 신청의 ID 와 입양자 ID
     */
    async rejectOtherOpenApplicationsForPet(
        petId: string,
        approvedApplicationId: string,
    ): Promise<RejectedApplicationRecord[]> {
        const openStatuses = [ApplicationStatus.CONSULTATION_PENDING, ApplicationStatus.CONSULTATION_COMPLETED];

        const candidates = await this.adoptionApplicationModel
            .find({
                petId,
                _id: { $ne: approvedApplicationId },
                status: { $in: openStatuses },
            })
            .select({ _id: 1, adopterId: 1 })
            .lean<Array<{ _id: Types.ObjectId; adopterId: Types.ObjectId }>>()
            .exec();

        const rejected: RejectedApplicationRecord[] = [];
        for (const candidate of candidates) {
            const transitioned = await this.adoptionApplicationModel
                .findOneAndUpdate(
                    { _id: candidate._id, status: { $in: openStatuses } },
                    { $set: { status: ApplicationStatus.ADOPTION_REJECTED } },
                )
                .exec();
            if (!transitioned) continue;
            rejected.push({
                applicationId: candidate._id.toString(),
                adopterId: candidate.adopterId.toString(),
            });
        }

        return rejected;
    }

    /**
     * 해당 펫에 상담완료(consultation_completed) 신청이 남아 있는지 여부.
     * 펫 예약 상태를 신청서에서 다시 계산할 때 쓰는 유일한 판단 근거다 —
     * 상담완료가 한 건이라도 있으면 예약중, 하나도 없으면 분양중으로 되돌린다.
     * @param petId 반려동물 ID
     * @returns 상담완료 신청 존재 여부
     */
    async existsConsultationCompletedForPet(petId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(petId)) return false;
        const found = await this.adoptionApplicationModel
            .exists({ petId: new Types.ObjectId(petId), status: ApplicationStatus.CONSULTATION_COMPLETED })
            .exec();
        return Boolean(found);
    }

    /**
     * 입양 신청 생성
     * @param data 생성할 데이터
     * @returns 생성된 AdoptionApplication
     */
    async create(data: Partial<AdoptionApplication>): Promise<AdoptionApplicationDocument> {
        const application = new this.adoptionApplicationModel(data);
        return application.save();
    }

    /**
     * 입양 신청 업데이트
     * @param id AdoptionApplication ID
     * @param updateData 업데이트할 데이터
     * @returns 업데이트된 AdoptionApplication 또는 null
     */
    async update(id: string, updateData: Partial<AdoptionApplication>): Promise<AdoptionApplicationDocument | null> {
        return this.adoptionApplicationModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
    }
}
