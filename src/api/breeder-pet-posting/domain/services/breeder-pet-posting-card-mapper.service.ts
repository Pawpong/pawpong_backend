import { Inject, Injectable } from '@nestjs/common';

import {
    BREEDER_PET_POSTING_ASSET_URL_PORT,
    type BreederPetPostingAssetUrlPort,
} from '../../application/ports/breeder-pet-posting-asset-url.port';
import type { BreederPetPostingCardSnapshot } from '../../application/ports/breeder-pet-posting-reader.port';
import { BreederPetPostingCardResponseDto } from '../../dto/response/breeder-pet-posting-card.dto';

/**
 * v2 분양글 카드 매퍼 (도메인 계층).
 *
 * representative photo 를 primary 로 노출하고 나이를 한국어로 변환한다.
 * StorageService(infra) 에 직접 의존하지 않고 BreederPetPostingAssetUrlPort 추상화로 URL 을 받는다.
 */
@Injectable()
export class BreederPetPostingCardMapperService {
    constructor(
        @Inject(BREEDER_PET_POSTING_ASSET_URL_PORT)
        private readonly assetUrl: BreederPetPostingAssetUrlPort,
    ) {}

    toCard(snapshot: BreederPetPostingCardSnapshot): BreederPetPostingCardResponseDto {
        const photoUrls = snapshot.photos.map((fileName) => this.assetUrl.toSignedUrl(fileName));
        const repIndex = Math.min(Math.max(0, snapshot.representativePhotoIndex), Math.max(0, photoUrls.length - 1));
        return {
            petId: snapshot.petId,
            name: snapshot.name,
            breed: snapshot.breed,
            gender: snapshot.gender,
            ageDescription: this.describeAge(snapshot.birthDate),
            price: snapshot.price,
            status: snapshot.status,
            primaryPhotoUrl: photoUrls[repIndex] ?? '',
            photoUrls,
            description: snapshot.description,
            inquiryCount: snapshot.inquiryCount,
            favoriteCount: snapshot.favoriteCount,
            viewCount: snapshot.viewCount,
            createdAt: snapshot.createdAt.toISOString(),
        };
    }

    private describeAge(birthDate: Date): string {
        if (!(birthDate instanceof Date) || Number.isNaN(birthDate.getTime())) {
            return '';
        }
        const ageInMonths = Math.max(0, Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        if (ageInMonths < 12) return `${ageInMonths}개월`;
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        return months === 0 ? `${years}살` : `${years}살 ${months}개월`;
    }
}
