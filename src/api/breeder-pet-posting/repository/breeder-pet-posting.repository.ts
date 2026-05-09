import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import type { BreederPetPostingCreatePersistData } from '../application/types/breeder-pet-posting-command.type';

/**
 * v2 분양글 — Mongoose 직접 접근을 캡슐화한다.
 * adapter 는 본 repository 만 사용하고 InjectModel 을 직접 참조하지 않는다.
 */
@Injectable()
export class BreederPetPostingRepository {
    constructor(
        @InjectModel(AvailablePet.name)
        private readonly availablePetModel: Model<AvailablePetDocument>,
    ) {}

    async create(data: BreederPetPostingCreatePersistData): Promise<{ _id: string }> {
        const created = await this.availablePetModel.create(data);
        return { _id: String(created._id) };
    }
}
