import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Breeder } from '../../../schema/breeder.schema';
import {
    AdoptionBreederSummary,
    AdoptionBreederSummaryPort,
} from '../application/ports/adoption-breeder-summary.port';

/**
 * Breeder 도큐먼트에서 입양 상세 화면 노출용 요약만 추출한다.
 * profileImageUrl 변환(signed URL)은 use-case 에서 AssetUrlPort 로 수행.
 */
@Injectable()
export class AdoptionBreederSummaryMongooseAdapter implements AdoptionBreederSummaryPort {
    constructor(@InjectModel(Breeder.name) private readonly model: Model<Breeder>) {}

    async readSummary(breederId: string): Promise<AdoptionBreederSummary | null> {
        if (!Types.ObjectId.isValid(breederId)) {
            return null;
        }

        const breeder: any = await this.model
            .findById(breederId, { nickname: 1, profile: 1, bpm: 1 })
            .lean()
            .exec();

        if (!breeder) {
            return null;
        }

        const profile = breeder.profile ?? {};
        const location = profile.location ?? {};

        // 표시용 닉네임: nickname 우선, 없으면 brandName fallback
        const displayName: string = breeder.nickname || profile.brandName || '';

        // 위치 표시: address > district > city 순으로 가장 구체적인 값
        const locationText: string | undefined = location.address || location.district || location.city || undefined;

        return {
            breederId: breeder._id.toString(),
            displayName,
            profileImageFileName: profile.profileImage || undefined,
            locationText,
            bpm: typeof breeder.bpm === 'number' ? breeder.bpm : 0,
        };
    }
}
