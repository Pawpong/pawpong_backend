import { Injectable } from '@nestjs/common';

import type { AdoptionPetSnapshot } from '../../application/ports/adoption-pet-reader.port';
import type { AdoptionPetItemResult } from '../../application/types/adoption-result.type';

const POPULAR_FAVORITE_THRESHOLD = 10;

@Injectable()
export class AdoptionPetMapperService {
    /**
     * 입양 가능 동물 카드 응답 매핑.
     * 사진은 미리 서명된 URL 배열로 변환되어 들어와야 한다 (use-case 단계).
     */
    toItem(
        pet: AdoptionPetSnapshot,
        photoUrls: string[],
        isFavorited: boolean,
        forcePopular?: boolean,
    ): AdoptionPetItemResult {
        return {
            petId: pet.id,
            breederId: pet.breederId,
            breederName: pet.breederName,
            name: pet.name,
            breed: pet.breed,
            petType: pet.petType,
            gender: pet.gender,
            ageDescription: this.describeAge(pet.birthDate),
            price: pet.price,
            status: pet.status,
            primaryPhotoUrl: photoUrls[0] ?? '',
            photoUrls,
            inquiryCount: pet.inquiryCount,
            favoriteCount: pet.favoriteCount,
            viewCount: pet.viewCount,
            isFavorited,
            isPopular: forcePopular ?? pet.favoriteCount >= POPULAR_FAVORITE_THRESHOLD,
            createdAt: pet.createdAt.toISOString(),
        };
    }

    /**
     * 출생일을 "n개월" / "n살" 등의 한국어 표현으로 변환.
     */
    describeAge(birthDate: Date): string {
        if (!(birthDate instanceof Date) || Number.isNaN(birthDate.getTime())) {
            return '';
        }
        const now = Date.now();
        const ageInMonths = Math.max(0, Math.floor((now - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));

        if (ageInMonths < 12) {
            return `${ageInMonths}개월`;
        }
        const years = Math.floor(ageInMonths / 12);
        const remainingMonths = ageInMonths % 12;
        if (remainingMonths === 0) {
            return `${years}살`;
        }
        return `${years}살 ${remainingMonths}개월`;
    }
}
