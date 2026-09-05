import { Injectable } from '@nestjs/common';

import type {
    BreederPetPostingDraftCardResult,
    BreederPetPostingDraftSnapshot,
} from '../../application/types/breeder-pet-posting-draft.type';

/**
 * v2 분양글 임시저장 — 목록 카드 조립.
 * form 은 미완성 payload 라 어떤 필드도 없을 수 있다 — 카드 표시는 전부 null 허용으로 다룬다.
 */
@Injectable()
export class BreederPetPostingDraftCardMapperService {
    toCard(snapshot: BreederPetPostingDraftSnapshot, primaryPhotoUrl: string | null): BreederPetPostingDraftCardResult {
        return {
            draftId: snapshot.draftId,
            name: this.asNonEmptyString(snapshot.form.name),
            breed: this.asNonEmptyString(snapshot.form.breed),
            primaryPhotoUrl,
            updatedAt: snapshot.updatedAt.toISOString(),
        };
    }

    /** form 에서 대표 사진 파일명을 뽑는다 (photos 배열의 대표 인덱스, 없으면 첫 장) */
    resolvePrimaryPhotoFileName(snapshot: BreederPetPostingDraftSnapshot): string | null {
        const photos = snapshot.form.photos;
        if (!Array.isArray(photos) || photos.length === 0) {
            return null;
        }
        const rawIndex = snapshot.form.representativePhotoIndex;
        const index = typeof rawIndex === 'number' && rawIndex >= 0 && rawIndex < photos.length ? rawIndex : 0;
        const fileName = photos[index];
        return typeof fileName === 'string' && fileName.trim().length > 0 ? fileName : null;
    }

    private asNonEmptyString(value: unknown): string | null {
        return typeof value === 'string' && value.trim().length > 0 ? value : null;
    }
}
