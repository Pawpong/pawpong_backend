import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    AdoptionApplication,
    AdoptionApplicationDocument,
} from '../../../schema/adoption-application.schema';
import { Adopter } from '../../../schema/adopter.schema';
import type { AdopterDocument } from '../../../schema/adopter.schema';
import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import type { AdoptionApplicationPersistData } from '../application/types/adoption-application.type';

/**
 * v2 입양 신청 — Mongoose 직접 접근 캡슐화.
 */
@Injectable()
export class AdoptionApplicationRepository {
    constructor(
        @InjectModel(AdoptionApplication.name)
        private readonly applicationModel: Model<AdoptionApplicationDocument>,
        @InjectModel(AvailablePet.name)
        private readonly availablePetModel: Model<AvailablePetDocument>,
        @InjectModel(Adopter.name)
        private readonly adopterModel: Model<AdopterDocument>,
    ) {}

    /**
     * 신규 입양 신청 대상이 될 수 있는 분양 펫만 반환.
     * - isActive: true (소프트 삭제 제외)
     * - status: 'available' (reserved/adopted 는 신규 신청 불가)
     */
    async findApplicablePet(petId: string): Promise<AvailablePetDocument | null> {
        if (!Types.ObjectId.isValid(petId)) return null;
        return this.availablePetModel
            .findOne({ _id: new Types.ObjectId(petId), isActive: true, status: 'available' })
            .lean<AvailablePetDocument>()
            .exec();
    }

    async findAdopter(adopterId: string): Promise<AdopterDocument | null> {
        if (!Types.ObjectId.isValid(adopterId)) return null;
        return this.adopterModel
            .findById(adopterId)
            .select({ realName: 1, nickname: 1, emailAddress: 1, phoneNumber: 1 })
            .lean<AdopterDocument>()
            .exec();
    }

    /**
     * 동일 adopter × pet 의 처리 중 신청(consultation_pending/consultation_completed) 존재 여부.
     * 카운터/문서 페치 없이 가벼운 exists 사용.
     */
    async existsOpenApplicationForPet(adopterId: string, petId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(adopterId) || !Types.ObjectId.isValid(petId)) return false;
        const found = await this.applicationModel.exists({
            adopterId: new Types.ObjectId(adopterId),
            petId: new Types.ObjectId(petId),
            status: { $in: ['consultation_pending', 'consultation_completed'] },
        });
        return Boolean(found);
    }

    async create(data: AdoptionApplicationPersistData): Promise<{ _id: string }> {
        const created = await this.applicationModel.create({
            ...data,
            breederId: new Types.ObjectId(data.breederId),
            adopterId: new Types.ObjectId(data.adopterId),
            petId: new Types.ObjectId(data.petId),
        });
        return { _id: String(created._id) };
    }
}
