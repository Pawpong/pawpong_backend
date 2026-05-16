import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Breeder } from '../../../schema/breeder.schema';
import { AdoptionBreederSummary, AdoptionBreederSummaryPort } from '../application/ports/adoption-breeder-summary.port';

/**
 * Breeder 도큐먼트에서 입양 상세 화면 노출용 요약만 추출한다.
 * profileImageUrl 변환(signed URL)은 use-case 에서 AssetUrlPort 로 수행.
 *
 * 보안/표시 규칙:
 * - displayName: 업체명(Breeder.name) 우선, 없으면 User.nickname fallback.
 * - profileImageFileName: User.profileImageFileName (아바타) 만 노출.
 *   BreederProfile.representativePhotos 는 브리더홈/탐색에서 별도 처리.
 * - locationText: district / city 까지만 노출. 상세 주소(address)는 PII 라 공개 응답에서 제외.
 */
@Injectable()
export class AdoptionBreederSummaryMongooseAdapter implements AdoptionBreederSummaryPort {
    constructor(@InjectModel(Breeder.name) private readonly model: Model<Breeder>) {}

    async readSummary(breederId: string): Promise<AdoptionBreederSummary | null> {
        if (!Types.ObjectId.isValid(breederId)) {
            return null;
        }

        const breeder = await this.model
            .findById(breederId, {
                name: 1,
                nickname: 1,
                profileImageFileName: 1,
                'profile.location.city': 1,
                'profile.location.district': 1,
                bpm: 1,
            })
            .lean<{
                _id: Types.ObjectId;
                name?: string;
                nickname?: string;
                profileImageFileName?: string;
                profile?: { location?: { city?: string; district?: string } };
                bpm?: number;
            }>()
            .exec();

        if (!breeder) {
            return null;
        }

        const location = breeder.profile?.location ?? {};

        // 표시용 닉네임: 업체명(브리더 name) 우선, 없으면 User.nickname fallback.
        const displayName: string = (breeder.name && breeder.name.trim()) || breeder.nickname || '';

        // 위치 표시: district 우선, 없으면 city. address 는 PII 라 노출하지 않는다.
        const locationText: string | undefined =
            (location.district && location.district.trim()) || (location.city && location.city.trim()) || undefined;

        return {
            breederId: breeder._id.toString(),
            displayName,
            profileImageFileName: breeder.profileImageFileName || undefined,
            locationText,
            bpm: typeof breeder.bpm === 'number' ? breeder.bpm : 0,
        };
    }
}
