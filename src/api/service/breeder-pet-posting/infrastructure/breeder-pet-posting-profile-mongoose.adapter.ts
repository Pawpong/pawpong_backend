import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import type {
    BreederPetPostingProfilePort,
    BreederPetPostingProfileSnapshot,
} from '../application/ports/breeder-pet-posting-profile.port';
import type { PostingPetType } from '../application/types/breeder-pet-posting-command.type';

const POSTING_PET_TYPES: readonly PostingPetType[] = ['dog', 'cat', 'reptile'];

/**
 * v2 분양글 — 브리더 존재와 축종을 조회한다.
 * Pawpong 의 Breeder 도큐먼트 _id 는 인증된 사용자 _id 와 동일하므로
 * userId 그대로 조회한다.
 */
@Injectable()
export class BreederPetPostingProfileMongooseAdapter implements BreederPetPostingProfilePort {
    constructor(
        @InjectModel(Breeder.name)
        private readonly breederModel: Model<BreederDocument>,
    ) {}

    async findById(userId: string): Promise<BreederPetPostingProfileSnapshot | null> {
        if (!Types.ObjectId.isValid(userId)) {
            return null;
        }
        const breeder = await this.breederModel.findById(userId).select({ _id: 1, petType: 1 }).lean();
        if (!breeder) {
            return null;
        }
        return { breederId: String(breeder._id), petType: toPostingPetType(breeder.petType) };
    }
}

/** enum 밖 값이 저장된 레거시 브리더 문서를 걸러낸다. */
function toPostingPetType(value: unknown): PostingPetType | undefined {
    return POSTING_PET_TYPES.includes(value as PostingPetType) ? (value as PostingPetType) : undefined;
}
